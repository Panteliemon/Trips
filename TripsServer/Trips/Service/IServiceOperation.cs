using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Trips.Entities;

namespace Trips.Service
{
    /// <summary>
    /// Service operation
    /// </summary>
    public interface IServiceOperation
    {
        string Key { get; }
        string Name { get; }
        string Description { get; }

        bool AllowsRepeat { get; }

        /// <summary>
        /// This method is supposed to perform service operation synchronously.
        /// Is called on separate thread (not threadpool)
        /// </summary>
        ServiceOperationResult Run(string parameters, IServiceOperationProgress progress, CancellationToken ct);
    }
}
