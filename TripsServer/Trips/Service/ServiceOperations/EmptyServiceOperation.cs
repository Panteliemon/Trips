using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Service.ServiceOperations
{ 
    class EmptyServiceOperation : IServiceOperation
    {
        public string Key => "EMPTY";

        public string Name => "Empty";

        public string Description => "Empty operation for development and testing functionality. Does nothing.";

        public bool AllowsRepeat => true;

        public ServiceOperationResult Run(string parameters, IServiceOperationProgress progress, CancellationToken ct)
        {
            const int iterations = 5;
            for (int i=0; i<5; i++)
            {
                if (ct.IsCancellationRequested)
                {
                    return ServiceOperationResult.Canceled;
                }

                Thread.Sleep(2000);
                
                if (ct.IsCancellationRequested)
                {
                    return ServiceOperationResult.Canceled;
                }

                progress.ReportProgress(iterations, i + 1);

                if (i == 1)
                {
                    progress.LogMessage("Message");
                    progress.LogWarning("Warning");
                    progress.LogError("Error");
                }
            }

            return ServiceOperationResult.Succeed;
        }
    }
}
