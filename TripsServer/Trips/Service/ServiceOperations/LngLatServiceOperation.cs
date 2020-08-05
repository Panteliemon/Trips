using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Trips.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using System.Globalization;

namespace Trips.Service.ServiceOperations
{
    class LngLatServiceOperation : IServiceOperation
    {
        class Coordinates
        {
            public Coordinates(double latitude, double longitude)
            {
                Latitude = latitude;
                Longitude = longitude;
            }

            public double Latitude { get; }
            public double Longitude { get; }
        }

        public string Key => "LNGLAT";

        public string Name => "Fill Latitude/Longitude by existing Location";

        public string Description => "Migration from string Location field to separate Latitude/Longitude fields."
            + "\r\nFor places where both Latitude and Longitude are null: analyzes Location field, and if there are coordinates, writes them to Latitude/Longitude.";

        public bool AllowsRepeat => true;

        public ServiceOperationResult Run(string parameters, IServiceOperationProgress progress, CancellationToken ct)
        {
            progress.LogMessage("Initializing...");

            TripsContext context = GetTripsContext();
            int[] allPlaces = context.Places.Select(p => p.Id).ToArray();

            progress.LogMessage($"{allPlaces.Length} places to process.");
            progress.LogMessage("Started");

            int processed = 0;
            int updated = 0;
            progress.ReportProgress(allPlaces.Length, processed);
            for (int i = 0; i < allPlaces.Length; i++)
            {
                ct.ThrowIfCancellationRequested();
                context = GetTripsContext();
                Place place = context.Places.Where(p => p.Id == allPlaces[i]).FirstOrDefault();

                if ((!place.Latitude.HasValue) && (!place.Longitude.HasValue))
                {
#pragma warning disable 618
                    Coordinates coordinates = GetCoordinates(place.Location);
#pragma warning restore 618
                    if (coordinates != null)
                    {
                        progress.LogMessage($"{place.Id}, {GetPlaceName(place)}: [{coordinates.Latitude}, {coordinates.Longitude}]");

                        place.Latitude = coordinates.Latitude;
                        place.Longitude = coordinates.Longitude;

                        context.SaveChanges();
                        updated++;
                    }
                    else
                    {
                        progress.LogMessage($"{place.Id}, {GetPlaceName(place)}: no coordinates in Location field.");
                    }
                }

                processed++;
                progress.ReportProgress(allPlaces.Length, processed);
            }

            progress.LogMessage("Finished!");
            progress.LogMessage($"Updated {updated} records");

            return ServiceOperationResult.Succeed;
        }

        private TripsContext GetTripsContext()
        {
            return new TripsContext(new DbContextOptions<TripsContext>());
        }

        /// <summary>
        /// From arbitrary string, which occasionaly might contain geographical coordinates
        /// in decimal form, extracts these coordinates. If no success, returns null.
        /// </summary>
        private Coordinates GetCoordinates(string str)
        {
            if (string.IsNullOrWhiteSpace(str))
            {
                return null;
            }

            string[] split = Regex.Split(str, @"[\s,]+");
            double? previousNumber = null;
            for (int i=0; i<split.Length; i++)
            {
                if (double.TryParse(split[i], NumberStyles.Any, CultureInfo.InvariantCulture, out double d))
                {
                    if (previousNumber.HasValue)
                    {
                        // Validate
                        if ((previousNumber < 90) && (previousNumber > -90)
                            && (d < 180) && (d >= -180))
                        {
                            return new Coordinates(previousNumber.Value, d);
                        }
                        else
                        {
                            // May be next number
                            previousNumber = d;
                        }
                    }
                    else
                    {
                        previousNumber = d;
                    }
                }
                else
                {
                    previousNumber = null;
                }
            }

            return null;
        }

        private string GetPlaceName(Place place)
        {
            if (string.IsNullOrWhiteSpace(place.Name))
            {
                return "< unnamed >";
            }
            else
            {
                return place.Name;
            }
        }
    }
}
