using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Trips.Entities.Pics;

namespace Trips
{
    public class PictureData
    {
        public PictureData(Guid id, PicFormat format, byte[] data)
        {
            Id = id;
            Format = format;
            Data = data;
        }

        public Guid Id { get; }
        public PicFormat Format { get; }
        public byte[] Data { get; }
    }
}
