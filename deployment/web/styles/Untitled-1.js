
var datagrid=dijit.registry.byNode($(".mx-name-grid1")[0]);
require(["dojo/aspect"], function(aspect){
    aspect.after(datagrid, "refreshGrid", function(){
        //为什么是childNodes[5].childNodes[1].childNodes[3].childNodes[3];在浏览器的控制台中数据$(".mx-name-grid1")就可看到目录树
        var  tables=$(".mx-name-grid1")[0].childNodes[5].childNodes[1].childNodes[3].childNodes[3].childNodes;
     
        $.each(tables, function (indexInArray, valueOfElement) { 
            //去第n行第一列
           var firstCell=valueOfElement.cells[0];
           firstCell.innerText=indexInArray;
        })
    });
  });