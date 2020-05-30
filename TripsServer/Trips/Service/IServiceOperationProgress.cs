using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Service
{
    public interface IServiceOperationProgress
    {
        void ReportProgress(long total, long done);
        void LogMessage(string msg);
        void LogWarning(string msg);
        void LogWarning(Exception ex, string msg = null);
        void LogError(Exception ex, string msg = null);
        void LogError(string msg);
    }
}
