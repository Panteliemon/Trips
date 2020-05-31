using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Trips.Entities;
using Trips.Service.ServiceOperations;

namespace Trips.Service
{
    public class ServiceOperationsManager
    {
        #region Types

        public enum StartResultCode
        {
            /// <summary>
            /// Successfully started
            /// </summary>
            Ok = 0,
            /// <summary>
            /// Wrong parameter (should never happen on working program)
            /// </summary>
            InvalidArgument = 1,
            /// <summary>
            /// Another service operation is already running, cannot run several operations simultaneously.
            /// </summary>
            AnotherRunsNow = 2,
            /// <summary>
            /// This operation can only be run once, and it was already run.
            /// </summary>
            RepeatForbidden = 3
        }

        public class StartResult
        {
            public StartResult(StartResultCode resultCode, int? operationId = null)
            {
                ResultCode = resultCode;
                OperationId = operationId;
            }

            public StartResultCode ResultCode { get; }
            public int? OperationId { get; }
        }

        public class OperationStatus
        {
            public OperationStatus(int operationId, IServiceOperation operation, DateTime startTime, long total, long done,
                ServiceOperationResult? result, DateTime? finishTime)
            {
                OperationId = operationId;
                Operation = operation;
                StartTime = startTime;
                Total = total;
                Done = done;
                Result = result;
                FinishTime = finishTime;
            }

            public int OperationId { get; }
            public IServiceOperation Operation { get; }
            public DateTime StartTime { get; }
            public long Total { get; }
            public long Done { get; }
            public ServiceOperationResult? Result { get; }
            public DateTime? FinishTime { get; }
        }

        class ServiceOperationProgress : IServiceOperationProgress
        {
            private Action<long, long> _reportProgressAction;
            private Action<string> _logMessageAction;
            private Action<Exception, string> _logWarningAction;
            private Action<Exception, string> _logErrorAction;

            public ServiceOperationProgress(Action<long, long> reportProgressAction,
                Action<string> logMessageAction,
                Action<Exception, string> logWarningAction,
                Action<Exception, string> logErrorAction)
            {
                _reportProgressAction = reportProgressAction;
                _logMessageAction = logMessageAction;
                _logWarningAction = logWarningAction;
                _logErrorAction = logErrorAction;
            }

            public void ReportProgress(long total, long done)
            {
                _reportProgressAction(total, done);
            }

            public void LogMessage(string msg)
            {
                _logMessageAction(msg);
            }

            public void LogWarning(string msg)
            {
                _logWarningAction(null, msg);
            }

            public void LogWarning(Exception ex, string msg = null)
            {
                _logWarningAction(ex, msg);
            }

            public void LogError(Exception ex, string msg = null)
            {
                _logErrorAction(ex, msg);
            }

            public void LogError(string msg)
            {
                _logErrorAction(null, msg);
            }
        }

        #endregion

        private object _locker = new object();
        private int _startedOperationsCounter;

        private bool _isCurrentOperationRunning;
        private ServiceOperationResult? _currentOperationResult;

        private IServiceOperation _currentOperation;
        private string _currentOperationParameters;
        private int _currentOperationId;
        
        private DateTime _currentOperationStartTime;
        private DateTime _currentOperationFinishTime;
        
        private long _currentOperationTotal;
        private long _currentOperationDone;
        private StringBuilder _currentOperationOutput;
        private StringBuilder _currentOperationLatestOutput;
        private bool _isCurrentOperationOutputEmpty; // to distinguish empty stringbuilder and stringbuilder containing ""

        private Thread _currentOperationThread;
        private CancellationTokenSource _currentOperationCts;

        public ServiceOperationsManager()
        {
            LoadServiceOperations();
        }

        /// <summary>
        /// Available service operations
        /// </summary>
        public List<IServiceOperation> ServiceOperations { get; } = new List<IServiceOperation>();

        /// <summary>
        /// Starts the service operation on separate thread.
        /// </summary>
        /// <param name="operation">This instance must be taken from the list</param>
        /// <param name="parameters">Parameters for operation, if needed</param>
        /// <returns></returns>
        public StartResult StartServiceOperation(IServiceOperation operation, string parameters = null)
        {
            lock (_locker)
            {
                if (_isCurrentOperationRunning)
                {
                    return new StartResult(StartResultCode.AnotherRunsNow);
                }

                if (!ServiceOperations.Contains(operation))
                {
                    return new StartResult(StartResultCode.InvalidArgument);
                }

                if (!operation.AllowsRepeat)
                {
                    TripsContext dbContext = GetTripsContext();
                    string keyForQuery = operation.Key;
                    var onceRunRecord = dbContext.ServiceOperationsHistory
                        .FirstOrDefault(h => (h.Key == keyForQuery) && (h.Result == ServiceOperationResult.Succeed));
                    if (onceRunRecord != null)
                    {
                        return new StartResult(StartResultCode.RepeatForbidden);
                    }
                }

                // It seems that we have no more excuses, need to really start now.
                _startedOperationsCounter++;

                _isCurrentOperationRunning = true;
                _currentOperationResult = null;
                _currentOperation = operation;
                _currentOperationParameters = parameters;
                _currentOperationId = _startedOperationsCounter;
                _currentOperationStartTime = DateTime.Now;
                _currentOperationTotal = 0;
                _currentOperationDone = 0;
                _currentOperationOutput = new StringBuilder();
                _currentOperationLatestOutput = new StringBuilder();
                _isCurrentOperationOutputEmpty = true;
                _currentOperationThread = new Thread(OperationThreadProc);
                _currentOperationCts = new CancellationTokenSource();

                _currentOperationThread.Start();
            }

            return new StartResult(StartResultCode.Ok, _currentOperationId);
        }

        /// <summary>
        /// Returns status of currently performed / currently finished service operation.
        /// If there were no operations run, returns null.
        /// </summary>
        /// <returns></returns>
        public OperationStatus GetCurrentOperationStatus()
        {
            lock (_locker)
            {
                if (_isCurrentOperationRunning || _currentOperationResult.HasValue)
                {
                    OperationStatus result = new OperationStatus(
                        _currentOperationId, _currentOperation,
                        _currentOperationStartTime, _currentOperationTotal, _currentOperationDone,
                        _currentOperationResult,
                        _currentOperationResult.HasValue ? _currentOperationFinishTime : (DateTime?)null);
                    return result;
                }
                else
                {
                    return null;
                }
            }
        }

        /// <summary>
        /// Takes part of operation report, which was written since last call of this method.
        /// Or since operation start, if this method wasn't called before.
        /// </summary>
        /// <returns></returns>
        public string TakeLatestOutput()
        {
            lock (_locker)
            {
                if (_currentOperationLatestOutput != null)
                {
                    string result = _currentOperationLatestOutput.ToString();
                    _currentOperationLatestOutput = new StringBuilder();
                    return result;
                }
            }

            return string.Empty;
        }

        /// <summary>
        /// Cancels currently running operation and returns task, which resolves to true
        /// when operation is really canceled. If no operation is currently running - 
        /// the result task is immediately resolved to false.
        /// </summary>
        /// <returns></returns>
        public Task<bool> CancelCurrentOperation()
        {
            // I will NOT wait under a lock, so must capture waiting-related parameters.
            Thread threadToWait = null;
            lock (_locker)
            {
                if (_isCurrentOperationRunning)
                {
                    threadToWait = _currentOperationThread;
                    _currentOperationCts.Cancel();
                }
                else
                {
                    return Task.FromResult(false);
                }
            }

            // Must wait.

            return Task.Run(() =>
            {
                threadToWait.Join();
                return true;
            });
        }

        #region Private Methods

        private void LoadServiceOperations()
        {
            ServiceOperations.Clear();
            ServiceOperations.Add(new EmptyServiceOperation());
            ServiceOperations.Add(new FillPictureFormatServiceOperation());
            ServiceOperations.Add(new PicturesMigrateServiceOperation(Program.PictureStorage));
        }

        private TripsContext GetTripsContext()
        {
            return new TripsContext(new DbContextOptions<TripsContext>());
        }

        private void OperationThreadProc()
        {
            ServiceOperationResult result;
            IServiceOperationProgress progress = new ServiceOperationProgress(
                ReportProgress, ReportString, ReportWarning, ReportError
            );

            try
            {
                result = _currentOperation.Run(_currentOperationParameters, progress, _currentOperationCts.Token);
            }
            catch (OperationCanceledException)
            {
                // That's ok, just canceled in other way than returning Canceled directly
                result = ServiceOperationResult.Canceled;
                ReportWarning(null, "OPERATION CANCELED"); // report only if canceled by exception
            }
            catch (Exception ex)
            {
                // That's bad
                result = ServiceOperationResult.Failed;
                ReportError(ex, "UNHANDLED EXCEPTION");
            }

            // Toggle current state and save the result
            ServiceOperationHistory rec = new ServiceOperationHistory();
            lock (_locker)
            {
                _isCurrentOperationRunning = false;
                _currentOperationResult = result;
                _currentOperationFinishTime = DateTime.Now;
                _currentOperationThread = null;
                _currentOperationCts = null;

                rec.Key = _currentOperation.Key;
                rec.Started = _currentOperationStartTime;
                rec.Ended = _currentOperationFinishTime;
                rec.Result = result;
                rec.Output = _currentOperationOutput.ToString();
            }

            try
            {
                TripsContext dbContext = GetTripsContext();
                dbContext.Add(rec);
                dbContext.SaveChanges();
            }
            catch (Exception)
            {
                // Now what?
            }
        }

        #region Reporting Funcs

        private string GetExceptionString(Exception ex)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append('[');
            sb.Append(ex.GetType().FullName);
            sb.Append(" \"");
            sb.Append(ex.Message);
            sb.AppendLine("\" Call stack: {");
            sb.AppendLine(ex.StackTrace);
            sb.Append("}");

            if (ex.InnerException != null)
            {
                sb.Append(" Inner exception: ");
                sb.Append(GetExceptionString(ex.InnerException));
            }

            sb.Append(']');
            return sb.ToString();
        }

        private void ReportProgress(long total, long done)
        {
            lock (_locker)
            {
                _currentOperationTotal = total;
                _currentOperationDone = done;
            }
        }

        private void ReportString(string str)
        {
            lock (_locker)
            {
                UnlockedAppendLine(_currentOperationOutput, str, _isCurrentOperationOutputEmpty);
                UnlockedAppendLine(_currentOperationLatestOutput, str, _isCurrentOperationOutputEmpty);
                _isCurrentOperationOutputEmpty = false;
            }
        }

        private void ReportWarning(Exception ex, string str)
        {
            if (ex == null)
            {
                ReportString("[!] " + str);
            }
            else
            {
                if (string.IsNullOrEmpty(str))
                {
                    ReportString("[!] " + GetExceptionString(ex));
                }
                else
                {
                    ReportString("[!] " + str + " " + GetExceptionString(ex));
                }
            }
        }

        private void ReportError(Exception ex, string str)
        {
            if (ex == null)
            {
                ReportString("[x] " + str);
            }
            else
            {
                if (string.IsNullOrEmpty(str))
                {
                    ReportString("[x] " + GetExceptionString(ex));
                }
                else
                {
                    ReportString("[x] " + str + " " + GetExceptionString(ex));
                }
            }
        }

        private void UnlockedAppendLine(StringBuilder sb, string str, bool isFirstLine)
        {
            if (!isFirstLine)
            {
                sb.AppendLine();
            }

            sb.Append(str);
        }

        #endregion

        #endregion
    }
}
