define("HTMLSnippet/widget/HTMLSnippetContext", [
    "dojo/_base/declare", "HTMLSnippet/widget/HTMLSnippet"
], function (declare, HTMLSnippet) {
    "use strict";

    // Declare widget"s prototype.
    return declare("HTMLSnippet.widget.HTMLSnippetContext", [HTMLSnippet]);

});

require(["HTMLSnippet/widget/HTMLSnippetContext"]);