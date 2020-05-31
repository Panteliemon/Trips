using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Trips.Entities;
using Trips.Entities.Pics;

namespace Trips.Service.ServiceOperations
{
    public class FillPictureFormatServiceOperation : IServiceOperation
    {
        public const string KEY = "PIC_FORMAT";

        public string Key => KEY;

        public string Name => "Fill picture format";

        public string Description => "Fills Format field in tables Pictures and Users.";

        public bool AllowsRepeat => true;

        public ServiceOperationResult Run(string parameters, IServiceOperationProgress progress, CancellationToken ct)
        {
            progress.LogMessage("//-------------------------------------------");
            progress.LogMessage("// Fill Picture Format service operation");
            progress.LogMessage("//-------------------------------------------");
            progress.LogMessage("initializing...");

            TripsContext tripsContext = GetTripsContext();
            var hRec = tripsContext.ServiceOperationsHistory.Where(h => h.Key == KEY).FirstOrDefault();
            if (hRec != null)
            {
                progress.LogMessage("The operation was already run, but nevermind.");
            }

            progress.LogMessage("Estimating work to be done...");

            ct.ThrowIfCancellationRequested();
            var picsToBeProcessed = tripsContext.Pictures.Where(p => p.Format == 0).Select(p => p.Id).ToList();
            ct.ThrowIfCancellationRequested();
            var usersToBeProcessed = tripsContext.Users.Where(
                u => (u.ProfilePictureFormat == null) && (u.ProfilePicture != null)).Select(u => u.Id).ToList();
            progress.LogMessage($"{picsToBeProcessed.Count} records to update in Pictures table");
            progress.LogMessage($"{usersToBeProcessed.Count} records to update in Users table");

            if ((picsToBeProcessed.Count == 0) && (usersToBeProcessed.Count == 0))
            {
                progress.LogMessage("Nothing TODO! Quit");
                return ServiceOperationResult.Succeed;
            }

            int total = picsToBeProcessed.Count + usersToBeProcessed.Count;
            int done = 0;
            progress.ReportProgress(total, done);

            progress.LogMessage("Processing pictures...");
            for (int i=0; i<picsToBeProcessed.Count; i++)
            {
                ct.ThrowIfCancellationRequested();

                int currentPictureId = picsToBeProcessed[i];
                TripsContext tc = GetTripsContext();
                Picture pic = tc.Pictures.Where(p => p.Id == currentPictureId).FirstOrDefault();
                if (pic != null)
                {
                    PicsContext pc = new PicsContext();
                    // Format is everywhere the same, so just read any of 3 pictures
                    Guid theId = pic.SmallSizeId;
                    var formatData = pc.PicData.Where(p => p.Id == theId).Select(p => new { Format = p.Format}).FirstOrDefault();
                    if (formatData == null)
                    {
                        progress.LogError($"Broken ref from picture {currentPictureId} to picture {theId}. Format is NOT defined.");
                    }
                    else
                    {
                        ct.ThrowIfCancellationRequested();

                        pic.Format = formatData.Format;
                        tc.SaveChanges();
                    }
                }
                else
                {
                    progress.LogWarning($"Picture id=={currentPictureId} existed when operation was started, and cannot be found now");
                }

                done++;
                progress.ReportProgress(total, done);
            }
            progress.LogMessage("[DONE]");

            progress.LogMessage("Processing users...");
            for (int i = 0; i < usersToBeProcessed.Count; i++)
            {
                ct.ThrowIfCancellationRequested();

                int currentUserId = usersToBeProcessed[i];
                TripsContext tc = GetTripsContext();
                User user = tc.Users.Where(u => u.Id == currentUserId).FirstOrDefault();
                if (user == null)
                {
                    progress.LogWarning($"User id=={currentUserId} existed when operation was started, and cannot be found now");
                }
                else
                {
                    if (user.ProfilePicture.HasValue)
                    {
                        PicsContext pc = new PicsContext();
                        Guid theId = user.ProfilePicture.Value;
                        var formatData = pc.PicData.Where(p => p.Id == theId).Select(p => new { Format = p.Format }).FirstOrDefault();
                        if (formatData == null)
                        {
                            progress.LogError($"Broken ref from user {currentUserId} to picture {theId}. Format is NOT defined.");
                        }
                        else
                        {
                            ct.ThrowIfCancellationRequested();

                            user.ProfilePictureFormat = formatData.Format;
                            tc.SaveChanges();
                        }
                    }
                }
            }
            progress.LogMessage("[DONE]");

            progress.LogMessage("Operation completed!");
            return ServiceOperationResult.Succeed;
        }

        private TripsContext GetTripsContext()
        {
            return new TripsContext(new DbContextOptions<TripsContext>());
        }
    }
}
