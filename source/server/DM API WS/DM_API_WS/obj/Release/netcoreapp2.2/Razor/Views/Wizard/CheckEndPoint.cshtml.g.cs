#pragma checksum "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml" "{ff1816ec-aa5e-4d10-87f7-6f4963833460}" "fede0467cd59d0aa2d0841acf807df3d0d30fa61"
// <auto-generated/>
#pragma warning disable 1591
[assembly: global::Microsoft.AspNetCore.Razor.Hosting.RazorCompiledItemAttribute(typeof(AspNetCore.Views_Wizard_CheckEndPoint), @"mvc.1.0.view", @"/Views/Wizard/CheckEndPoint.cshtml")]
[assembly:global::Microsoft.AspNetCore.Mvc.Razor.Compilation.RazorViewAttribute(@"/Views/Wizard/CheckEndPoint.cshtml", typeof(AspNetCore.Views_Wizard_CheckEndPoint))]
namespace AspNetCore
{
    #line hidden
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.Rendering;
    using Microsoft.AspNetCore.Mvc.ViewFeatures;
    [global::Microsoft.AspNetCore.Razor.Hosting.RazorSourceChecksumAttribute(@"SHA1", @"fede0467cd59d0aa2d0841acf807df3d0d30fa61", @"/Views/Wizard/CheckEndPoint.cshtml")]
    public class Views_Wizard_CheckEndPoint : global::Microsoft.AspNetCore.Mvc.Razor.RazorPage<DM_API_WS.Wizard.Model.ConfigData>
    {
        private static readonly global::Microsoft.AspNetCore.Razor.TagHelpers.TagHelperAttribute __tagHelperAttribute_0 = new global::Microsoft.AspNetCore.Razor.TagHelpers.TagHelperAttribute("href", new global::Microsoft.AspNetCore.Html.HtmlString("~/Wizard/Home"), global::Microsoft.AspNetCore.Razor.TagHelpers.HtmlAttributeValueStyle.DoubleQuotes);
        #line hidden
        #pragma warning disable 0169
        private string __tagHelperStringValueBuffer;
        #pragma warning restore 0169
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperExecutionContext __tagHelperExecutionContext;
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperRunner __tagHelperRunner = new global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperRunner();
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperScopeManager __backed__tagHelperScopeManager = null;
        private global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperScopeManager __tagHelperScopeManager
        {
            get
            {
                if (__backed__tagHelperScopeManager == null)
                {
                    __backed__tagHelperScopeManager = new global::Microsoft.AspNetCore.Razor.Runtime.TagHelpers.TagHelperScopeManager(StartTagHelperWritingScope, EndTagHelperWritingScope);
                }
                return __backed__tagHelperScopeManager;
            }
        }
        private global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.UrlResolutionTagHelper __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_UrlResolutionTagHelper;
        #pragma warning disable 1998
        public async override global::System.Threading.Tasks.Task ExecuteAsync()
        {
#line 2 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
  
    ViewData["Title"] = "Check";

#line default
#line hidden
            BeginContext(83, 33, true);
            WriteLiteral("\r\n<h1>Check MetaData API</h1>\r\n\r\n");
            EndContext();
#line 8 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
 using (Html.BeginForm("CheckEndPoint", "Wizard", FormMethod.Post))
{
    //this is for create form tag

#line default
#line hidden
            BeginContext(224, 23, false);
#line 11 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
Write(Html.AntiForgeryToken());

#line default
#line hidden
            EndContext();
#line 11 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
                         // this is for prevent CSRF attack

#line default
#line hidden
            BeginContext(285, 28, false);
#line 12 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
Write(Html.ValidationSummary(true));

#line default
#line hidden
            EndContext();
#line 12 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
                             
    if (@ViewBag.Message != null)
    {

#line default
#line hidden
            BeginContext(357, 40, true);
            WriteLiteral("<div style=\"border:1px solid red\">\r\n    ");
            EndContext();
            BeginContext(398, 15, false);
#line 16 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
Write(ViewBag.Message);

#line default
#line hidden
            EndContext();
            BeginContext(413, 10, true);
            WriteLiteral("\r\n</div>\r\n");
            EndContext();
#line 18 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
    }


#line default
#line hidden
            BeginContext(432, 75, true);
            WriteLiteral("<table>\r\n    <tr>\r\n        <td><span>EndPoint URL</span></td>\r\n        <td>");
            EndContext();
            BeginContext(508, 130, false);
#line 23 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
       Write(Html.TextBoxFor(a => a.MA, new { placeholder = "https://www.endpoint.ext:44375/", @class = "form-input", style = "width:500px;" }));

#line default
#line hidden
            EndContext();
            BeginContext(638, 167, true);
            WriteLiteral("</td>\r\n    </tr>\r\n    <tr>\r\n        <td></td>\r\n        <td>\r\n            <input type=\"submit\" value=\"Check\" />\r\n        </td>\r\n        <td></td>\r\n    </tr>\r\n</table>\r\n");
            EndContext();
#line 33 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
    if (@ViewBag.EndPointStatus != null)
    {

#line default
#line hidden
            BeginContext(854, 29, true);
            WriteLiteral("<h3>Result:</h3>\r\n<div>\r\n    ");
            EndContext();
            BeginContext(884, 22, false);
#line 37 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
Write(ViewBag.EndPointStatus);

#line default
#line hidden
            EndContext();
            BeginContext(906, 24, true);
            WriteLiteral("\r\n    <br /><br />\r\n    ");
            EndContext();
            BeginContext(931, 29, false);
#line 39 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
Write(ViewBag.EndPointStatusMessage);

#line default
#line hidden
            EndContext();
            BeginContext(960, 10, true);
            WriteLiteral("\r\n</div>\r\n");
            EndContext();
#line 41 "C:\Users\f.pitto\Source\repos\sistan-hub\DM API WS\DM_API_WS\Views\Wizard\CheckEndPoint.cshtml"
    }
}

#line default
#line hidden
            BeginContext(980, 14, true);
            WriteLiteral("<br /><br />\r\n");
            EndContext();
            BeginContext(994, 40, false);
            __tagHelperExecutionContext = __tagHelperScopeManager.Begin("a", global::Microsoft.AspNetCore.Razor.TagHelpers.TagMode.StartTagAndEndTag, "fede0467cd59d0aa2d0841acf807df3d0d30fa617327", async() => {
                BeginContext(1018, 12, true);
                WriteLiteral("Back to Home");
                EndContext();
            }
            );
            __Microsoft_AspNetCore_Mvc_Razor_TagHelpers_UrlResolutionTagHelper = CreateTagHelper<global::Microsoft.AspNetCore.Mvc.Razor.TagHelpers.UrlResolutionTagHelper>();
            __tagHelperExecutionContext.Add(__Microsoft_AspNetCore_Mvc_Razor_TagHelpers_UrlResolutionTagHelper);
            __tagHelperExecutionContext.AddHtmlAttribute(__tagHelperAttribute_0);
            await __tagHelperRunner.RunAsync(__tagHelperExecutionContext);
            if (!__tagHelperExecutionContext.Output.IsContentModified)
            {
                await __tagHelperExecutionContext.SetOutputContentAsync();
            }
            Write(__tagHelperExecutionContext.Output);
            __tagHelperExecutionContext = __tagHelperScopeManager.End();
            EndContext();
        }
        #pragma warning restore 1998
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.ViewFeatures.IModelExpressionProvider ModelExpressionProvider { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.IUrlHelper Url { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.IViewComponentHelper Component { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.Rendering.IJsonHelper Json { get; private set; }
        [global::Microsoft.AspNetCore.Mvc.Razor.Internal.RazorInjectAttribute]
        public global::Microsoft.AspNetCore.Mvc.Rendering.IHtmlHelper<DM_API_WS.Wizard.Model.ConfigData> Html { get; private set; }
    }
}
#pragma warning restore 1591