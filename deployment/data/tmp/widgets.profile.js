dependencies = {
    layers: [
        {
            name: "../mxui/mxui.js",
            resourceName: "mxui.mxui",
            dependencies: [ "mxui.mxui" ],
            discard: true
        },
        {
            name: "./widgets/widgets.js",
            resourceName: "widgets.widgets",
            dependencies: ["widgets.widgets"],
            layerDependencies: [ "../mxui/mxui.js" ],
            noref: true
        }
    ],
    prefixes: [
        [ "dojox", "../dojox" ],
        [ "dijit", "../dijit" ],

        [ "mxui", "../mxui" ],
        [ "mendix", "../mendix" ],

        [ "big", "../big" ],
        [ "DataGridExtension", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\DataGridExtension" ],
        [ "DataGridExtension", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\DataGridExtension" ],
        [ "DataGridExtension", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\DataGridExtension" ],
        [ "ExportToExcel", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\ExportToExcel" ],
        [ "HTMLSnippet", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\HTMLSnippet" ],
        [ "HTMLSnippet", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\HTMLSnippet" ],
        [ "ImageViewer", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\ImageViewer" ],
        [ "ImageViewer", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\ImageViewer" ],
        [ "JSExecutor", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\JSExecutor" ],
        [ "PieChart", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\PieChart" ],
        [ "SprintrFeedbackWidget", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\web\\widgets\\SprintrFeedbackWidget" ], [ "widgets", "C:\\Users\\mr.gao\\Documents\\Mendix\\Project\\mendix\\deployment\\data\\tmp\\widgets" ]

    ]
};