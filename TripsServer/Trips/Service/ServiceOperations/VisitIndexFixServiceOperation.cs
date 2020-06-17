using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Trips.Entities;

namespace Trips.Service.ServiceOperations
{
    class VisitIndexFixServiceOperation : IServiceOperation
    {
        #region IServiceOperation

        public string Key => "FIX_VIZITINDEX";

        public string Name => "Fix Visit Index";

        public string Description => "Fixes consequences of fill index bug";

        public bool AllowsRepeat => true;

        public ServiceOperationResult Run(string parameters, IServiceOperationProgress progress, CancellationToken ct)
        {
            progress.LogMessage("Started. Querying all trips...");

            TripsContext context = GetTripsContext();
            List<Trip> allTrips = context.Trips.AsQueryable().Include(t => t.Visits).ToList();
            ct.ThrowIfCancellationRequested();

            progress.LogMessage($"{allTrips.Count} trips loaded");
            progress.ReportProgress(allTrips.Count, 0);

            int problemCounter = 0;

            for (int j=0; j<allTrips.Count; j++)
            {
                Trip t = allTrips[j];
                ct.ThrowIfCancellationRequested();
                var orderedVisits = t.Visits.OrderBy(v => v.Index).ToList();

                bool reorderNeeded = false;
                int? lastIndex = null;
                for (int i = 0; i < orderedVisits.Count; i++)
                {
                    if (lastIndex.HasValue)
                    {
                        if (orderedVisits[i].Index == lastIndex.Value)
                        {
                            reorderNeeded = true;
                            break;
                        }
                    }
                    else
                    {
                        lastIndex = orderedVisits[i].Index;
                    }
                }

                if (reorderNeeded)
                {
                    problemCounter++;

                    progress.LogMessage(string.Empty);
                    progress.LogMessage($"Problem with trip {t.Id} {t.Title}");
                    progress.LogMessage("Visit indexes are:");
                    for (int i=0; i< orderedVisits.Count; i++)
                    {
                        progress.LogMessage($"id: {orderedVisits[i].Id} index: {orderedVisits[i].Index}");
                    }

                    progress.LogMessage("updating...");
                    Update(t.Id, progress);
                    progress.LogMessage("[OK]");
                }

                progress.ReportProgress(allTrips.Count, j + 1);
            }

            if (problemCounter == 0)
            {
                progress.LogMessage("No problems encountered");
            }
            else
            {
                progress.LogMessage(string.Empty);
            }
            progress.LogMessage("Finished");

            return ServiceOperationResult.Succeed;
        }

        #endregion

        #region Private Methods

        private void Update(int tripId, IServiceOperationProgress progress)
        {
            TripsContext context = GetTripsContext();
            Trip trip = context.Trips.Where(t => t.Id == tripId).Include(v => v.Visits).FirstOrDefault();
            if (trip != null)
            {
                List<Visit> orderedVisits = trip.Visits.OrderBy(v => v.Index).ToList();
                for (int i = 0; i < orderedVisits.Count; i++)
                {
                    orderedVisits[i].Index = i;
                }

                context.SaveChanges();
            }
            else
            {
                progress.LogError("oops, not found");
            }
        }

        private TripsContext GetTripsContext()
        {
            return new TripsContext(new DbContextOptions<TripsContext>());
        }

        #endregion
    }
}
