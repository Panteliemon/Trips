using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Trips.Dtos;
using Trips.Entities;
using Trips.Service;

namespace Trips.Controllers
{
    [ApiController]
    [Authorize]
    public class ServiceController : TripsControllerBase
    {
        private static object _mgrLocker = new object();
        private static ServiceOperationsManager _mgr;

        public ServiceController(TripsContext dbContext, IMapper mapper) : base(dbContext, mapper)
        {
        }

        [HttpGet]
        [Route("service/list")]
        public async Task<List<ServiceOperationDto>> GetOperationsList()
        {
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.IsAdmin))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return null;
            }

            InitManager();

            List<ServiceOperationDto> result = new List<ServiceOperationDto>();
            foreach (var operation in _mgr.ServiceOperations)
            {
                ServiceOperationDto dto = new ServiceOperationDto();
                dto.Key = operation.Key;
                dto.Name = operation.Name;
                dto.Description = operation.Description;

                string keyForSearch = operation.Key;
                var historyRec = await DbContext.ServiceOperationsHistory.Where(h => h.Key == keyForSearch)
                    .OrderByDescending(h => h.Ended).Take(1).FirstOrDefaultAsync();
                if (historyRec != null)
                {
                    dto.LastStarted = historyRec.Started;
                    dto.LastEnded = historyRec.Ended;
                    dto.LastResult = historyRec.Result;
                }

                result.Add(dto);
            }

            return result;
        }

        [HttpPost]
        [Route("service/start")]
        public async Task<ServiceOperationsManager.StartResult> StartOperation(string key)
        {
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.IsAdmin))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return null;
            }

            InitManager();

            var operation = _mgr.ServiceOperations.FirstOrDefault(op => op.Key == key);
            if (operation == null)
            {
                Response.StatusCode = StatusCodes.Status404NotFound;
                return null;
            }

            var result = _mgr.StartServiceOperation(operation);
            return result;
        }

        [HttpGet]
        [Route("service/status")]
        public async Task<ServiceOperationStatusDto> GetCurrentStatus()
        {
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.IsAdmin))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return null;
            }

            InitManager();

            var status = _mgr.GetCurrentOperationStatus();
            if (status == null)
            {
                return null;
            }
            else
            {
                ServiceOperationStatusDto dto = new ServiceOperationStatusDto();
                dto.OperationId = status.OperationId;
                dto.Key = status.Operation.Key;
                dto.Name = status.Operation.Name;
                dto.Description = status.Operation.Description;
                dto.StartTime = status.StartTime;
                dto.Total = status.Total;
                dto.Done = status.Done;
                dto.Result = status.Result;
                dto.FinishTime = status.FinishTime;
                return dto;
            }
        }

        [HttpPost]
        [Route("service/takeoutput")]
        public async Task<string> TakeLatestOutput()
        {
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.IsAdmin))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return null;
            }

            InitManager();

            return _mgr.TakeLatestOutput();
        }

        [HttpPost]
        [Route("service/cancel")]
        public async Task<bool> CancelCurrentOperation()
        {
            User currentUser = await GetCurrentUserAsync();
            if ((currentUser == null) || (!currentUser.IsAdmin))
            {
                Response.StatusCode = StatusCodes.Status403Forbidden;
                return false;
            }

            InitManager();

            return await _mgr.CancelCurrentOperation();
        }

        private void InitManager()
        {
            lock (_mgrLocker)
            {
                if (_mgr == null)
                {
                    _mgr = new ServiceOperationsManager();
                }
            }
        }
    }
}