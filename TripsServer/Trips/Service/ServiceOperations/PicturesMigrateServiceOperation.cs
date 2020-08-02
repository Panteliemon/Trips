using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Trips.Entities;
using Trips.Entities.Pics;
using Trips.PictureStorages;

namespace Trips.Service.ServiceOperations
{
    /* REMOVED with removing PicsDB
     * The code left here for history.
    public class PicturesMigrateServiceOperation : IServiceOperation
    {
        private IPictureStorage _targetStorage;

        public PicturesMigrateServiceOperation(IPictureStorage targetStorage)
        {
            _targetStorage = targetStorage;
        }

        public string Key => "MIGRATE_PICS";

        public string Name => "Pictures Migration";

        public string Description => @"Copies all pictures data from PicsDB database to either local PC folder or Amazon S3 cloud, depending on dbconfig.xml UseRemote parameter.
This is one-time operation, i.e. once successfully completed, cannot be run again on the same TripsDB. Please ensure that current TripsDB being used corresponds to the current PicsDB.
When launched, this operation will display info about what it is going to do, and you will have 30 seconds to cancel the operation if you disagree before its actual start.";

        public bool AllowsRepeat => false;

        public ServiceOperationResult Run(string parameters, IServiceOperationProgress progress, CancellationToken ct)
        {
            progress.LogMessage("//----------------------------------------------------");
            progress.LogMessage("// PICTURES MIGRATION");
            progress.LogMessage("//----------------------------------------------------");

            //------------ Prerequisites

            if (!Program.IsLocked)
            {
                progress.LogError("This operation can only be run when the app is in readonly mode.");
            }

            if (_targetStorage is DatabasePictureStorage)
            {
                progress.LogWarning("Destination storage is the same as source. Auto cancel.");
                return ServiceOperationResult.Canceled;
            }
            else if (_targetStorage is LocalFSPictureStorage localFsStorage)
            {
                progress.LogMessage("[i] This operation will copy all the existing uploaded pictures from [DATABASE] to [LOCAL PC FOLDER]");
                progress.LogMessage($"Make sure that folder \"{localFsStorage.RootFolder}\" is empty.");
            }
            else if (_targetStorage is AmazonS3PictureStorage)
            {
                progress.LogMessage("[i] This operation will copy all the existing uploaded pictures from [DATABASE] to [AMAZON S3 CLOUD]");
            }
            else
            {
                progress.LogError("The picture storage to migrate to is not recognized. Operation aborted for safety reasons.");
                return ServiceOperationResult.Failed;
            }

            // Check dependencies
            TripsContext tripsContext = GetTripsContext();
            var fillFormatRec = tripsContext.ServiceOperationsHistory
                .Where(h => (h.Key == FillPictureFormatServiceOperation.KEY)
                            && (h.Result == ServiceOperationResult.Succeed))
                .FirstOrDefault();
            if (fillFormatRec == null)
            {
                progress.LogError("This operation can only be run after \"Fill picture format\" has been performed.");
                return ServiceOperationResult.Failed;
            }

            ct.ThrowIfCancellationRequested();

            //------------ Calculate amount of work
            progress.LogMessage("calculating amount of work...");

            PicsContext picsContext = new PicsContext();
            int picturesCount = picsContext.PicData.Count();
            if (picturesCount == 0)
            {
                progress.LogMessage("[i] There is no pictures in DB. This means there is nothing to transfer.");
                progress.LogMessage("[ALL DONE]");
                progress.LogMessage("Have a nice day!");
                return ServiceOperationResult.Succeed;
            }

            //ct.ThrowIfCancellationRequested();
            //long bytesToTransfer = picsContext.PicData.Select(pd => pd.Data.Count()).Sum(v => (long)v);
            // Well, array length in EF Core lambdas is not yet supported, so we have to
            // act in blind and measure our progress by pictures count.

            ct.ThrowIfCancellationRequested();

            progress.LogMessage($"{picturesCount} pictures are about to be transferred.");
            progress.LogMessage("");
            progress.LogMessage("Please check the info above. After 30 seconds, if not canceled, the operation will start.");

            Task.Delay(10000).Wait(ct);
            progress.LogMessage("20 seconds left...");
            Task.Delay(10000).Wait(ct);
            progress.LogMessage("10 seconds left...");
            Task.Delay(11000).Wait(ct);

            //------------ Capture all ids

            int done = 0;
            progress.ReportProgress(picturesCount, done);
            progress.LogMessage("");
            progress.LogMessage("[STARTED]");

            picsContext = new PicsContext();
            List<Guid> allIds = picsContext.PicData.Select(pd => pd.Id).ToList();

            //------------ Main cycle

            long bytesCounter = 0;
            int errorCounter = 0;
            foreach (Guid id in allIds)
            {
                ct.ThrowIfCancellationRequested();

                picsContext = new PicsContext();
                PicData picData = picsContext.PicData.Where(pd => pd.Id == id).FirstOrDefault();
                if (picData == null)
                {
                    progress.LogWarning($"Picture {id} not found");
                }
                else
                {
                    ct.ThrowIfCancellationRequested();

                    try
                    {
                        PictureData dataToUpload = new PictureData(id, picData.Format, picData.Data);
                        _targetStorage.UploadPictures(dataToUpload).Wait();

                        bytesCounter += picData.Data.Length;
                    }
                    catch (Exception ex)
                    {
                        progress.LogError(ex, $"Error uploading picture {id}");
                        errorCounter++;
                    }

                    done++;
                    progress.ReportProgress(picturesCount, done);
                }
            }

            //------------ Finish
            progress.LogMessage($"{bytesCounter} bytes transferred");
            if (errorCounter == 0)
            {
                progress.LogMessage("[ALL DONE]");
                progress.LogMessage("Congrats!");
                return ServiceOperationResult.Succeed;
            }
            else
            {
                progress.LogMessage($"[FINISHED WITH {errorCounter} ERRORS]");
                return ServiceOperationResult.Failed;
            }
        }

        private TripsContext GetTripsContext()
        {
            return new TripsContext(new DbContextOptions<TripsContext>());
        }
    }
    */
}
