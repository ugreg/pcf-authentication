﻿using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;

namespace CDS.CustomControl.Encryption
{
    internal class Provider : IProvider
    {
        private IExecutionContext passThroughOnlyExecutionContext;
        private IOrganizationService passThroughOnlyOrganizationService;
        private ITracingService passThroughOnlyTracingService;

        private static HttpClient httpClient = new HttpClient();

        public Provider(IExecutionContext context, IOrganizationService service, ITracingService logs)
        {
            passThroughOnlyExecutionContext = context;
            passThroughOnlyOrganizationService = service;
            passThroughOnlyTracingService = logs;
        }

        public async void NotifyEvent()
        {
            passThroughOnlyTracingService.Trace("In NotifyEvent");

            var cdsDataAccessLayer = new CDSDataAccessLayer(
                passThroughOnlyExecutionContext, passThroughOnlyOrganizationService, passThroughOnlyTracingService);

            passThroughOnlyTracingService.Trace("Getting cds system user data");
            Dictionary<string, dynamic> cdsUser = cdsDataAccessLayer.GetCDSUserData();

            // TODO: handle dynamics regions in URL
            // emea = crm4.dynamics.com, na = crm.dynamics.com AND https://docs.microsoft.com/en-us/dynamics365/customer-engagement/admin/manage-user-account-synchronization
            httpClient.BaseAddress = new Uri("https://org.api.dynamics.com/");

            var message = new StringBuilder("");

            if (cdsUser.ContainsKey("fullname"))
            {
                message.Append(cdsUser["fullname"] + " completed the ");
            }
            else { message.Append("USERNAME ERROR completed the "); }

            string email = "";
            string token = "";
            if (cdsUser.ContainsKey("internalemailaddress"))
            { email = cdsUser["internalemailaddress"]; }

            if (cdsUser.ContainsKey("azureactivedirectoryobjectid"))
            { token = cdsUser["azureactivedirectoryobjectid"]; }

            passThroughOnlyTracingService.Trace("Message " + message.ToString());

            FormUrlEncodedContent formUrlEncodedContent = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("SHA", "token"),
                new KeyValuePair<string, string>("Message", message.ToString())
            });

            string cdsUserToken = "";
            string systemUserId = "00000000-0000-0000-0000-000000000000";
            string internalemailaddress = "supermario@mushroom.kingdom";
            string azureActiveDirectoryObjectId = "00000000-0000-0000-0000-000000000001";
            string input = "";
            input += systemUserId;
            input += internalemailaddress;
            input += azureActiveDirectoryObjectId;
            using (SHA1Managed sha1 = new SHA1Managed())
            {
                var hash = sha1.ComputeHash(Encoding.UTF8.GetBytes(input));
                var sb = new StringBuilder(hash.Length * 2);

                foreach (byte b in hash)
                {
                    // "x2" for lowercase
                    sb.Append(b.ToString("X2"));
                }
                cdsUserToken = sb.ToString();
            }

            string azFuncResponse = "Waiting for azFuncResponse...";
            const string azureFunctionUrl = "https://cdscryptography.azurewebsites.net/api/HttpTriggerRestSharp";
            var httpWebRequest = (HttpWebRequest)WebRequest.Create(azureFunctionUrl);
            httpWebRequest.ContentType = "application/json; charset=utf-8";
            httpWebRequest.Method = "POST";
            string json = "";
            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {
                //json =
                //'{' +
                //    "\"client_id\" : \"" + AppConfig.CLIENT_ID + "\"," +
                //    "\"client_secret\" : \"" + AppConfig.CLIENT_SECRET + "\"," +
                //    "\"username\" : \"" + AppConfig.EXTERNEL_USER + "\"," +
                //    "\"password\" : \"" + AppConfig.EXTERNEL_PASSWORD + "\"" +
                //'}';

                json = "";
                streamWriter.Write(json);
                streamWriter.Flush();
            }
            try {
                var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
                using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    var responseText = streamReader.ReadToEnd();
                    azFuncResponse = responseText;
                    Console.WriteLine(responseText);
                }
            } catch (WebException ex) {

                Console.WriteLine(ex.Message);
                throw;
            }

            passThroughOnlyTracingService.Trace("Generated signed token " + cdsUserToken + " REAL token " + azFuncResponse);

            //var response = new HttpResponseMessage();
            //response = await httpClient.PostAsync("api/cds/authentication/token", formUrlEncodedContent);
            //response.EnsureSuccessStatusCode();
        }
    }
}
