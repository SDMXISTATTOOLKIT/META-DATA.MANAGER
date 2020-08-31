using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DM_API_WS.Controllers
{
    /// <summary>
    /// Landing Page
    /// </summary>
    [Route("")]
    [ApiController]
    public class LandingController : Controller
    {
        /// <summary>
        /// Start page
        /// </summary>
        [HttpGet("Home")]
        public ActionResult Home()
        {
            return Redirect("~/Wizard/Home");
        }

        /// <summary>
        /// Start page
        /// </summary>
        [HttpGet("Index")]
        public ActionResult Index()
        {
            return Redirect("~/Wizard/Home");
        }

        /// <summary>
        /// Start page
        /// </summary>
        [HttpGet]
        public ActionResult Get()
        {
            return Redirect("~/Wizard/Home");
        }

        /// <summary>
        /// Start page
        /// </summary>
        [HttpGet("Start")]
        public ActionResult Start()
        {
            return Redirect("~/Wizard/Home");
        }
    }
}
