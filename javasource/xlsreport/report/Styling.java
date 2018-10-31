/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package xlsreport.report;

import com.mendix.core.Core;
import com.mendix.core.CoreException;
import com.mendix.logging.ILogNode;
import com.mendix.systemwideinterfaces.core.IContext;
import com.mendix.systemwideinterfaces.core.IMendixObject;

import java.util.HashMap;
import java.util.List;

import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.*;

import xlsreport.proxies.*;
import xlsreport.report.export.Export;

/**
 *
 * @author jvg
 */
public class Styling
{
	private static final String DATEFORMAT = "_Date";
	private static ILogNode log = Core.getLogger("XLSreport");   
	private HashMap<String, CellStyle> styleList;
    private CellStyle defaultStyle;
    private CellStyle defaultStyleDate;
    private CreationHelper createHelper;
    private String datePresentation;
    
    public Styling(MxTemplate template)
    {
    	this.datePresentation = Export.getDatePresentation(template);
    	this.styleList = new HashMap<String, CellStyle>();
    }

    public CellStyle getDefaultStyle()
    {
        return this.defaultStyle;
    }
    
    public CellStyle getDefaultStyle(boolean dateTimeFormat)
    {
    	if(dateTimeFormat)
    	{
    		return this.defaultStyleDate;
    	} else
    	{
    		return this.defaultStyle;
    	}
    }

    public void setDefaultStyle(Long GUID)
    {        
    	this.defaultStyle = this.styleList.get(GUID);
        this.defaultStyleDate = this.styleList.get(GUID+DATEFORMAT);
    }

    public CellStyle getStyle(Long name, boolean useDateTimeFormat)
    {
    	if(useDateTimeFormat)
    	{    		
    		return styleList.get(name.toString()+DATEFORMAT);
    	} else
    	{
    		return styleList.get(name.toString());
    	}
    }

    public void setAllStyles(IContext context, MxTemplate TemplateObject, Workbook book) throws CoreException
    {
        if (styleList != null)
        {
            styleList.clear();
        }
        
        this.createHelper = book.getCreationHelper();
        
        //CreationHelper createHelper = book.getCreationHelper();
        log.debug("-- Initialise all the styles to the hashmap.");

        List<IMendixObject> stylesObjects = Core.retrieveXPathQuery(context,"//" + MxCellStyle.getType()
                + "[XLSReport.MxCellStyle_Template='" + TemplateObject.getMendixObject().getId().toLong() + "']");

        for (IMendixObject styleObject : stylesObjects)
        {
            // Create a style
            MxCellStyle MxStyle = MxCellStyle.initialize(context, styleObject);            
            
            // Create a normal version of the style
            CellStyle style = createCellStyle(MxStyle, book, false);
            this.styleList.put(MxStyle.getMendixObject().getId().toLong()+"", style);
            
            // Create a normal version of the style
            CellStyle datestyle = createCellStyle(MxStyle, book, true);
            this.styleList.put(MxStyle.getMendixObject().getId().toLong()+DATEFORMAT, datestyle);           
        }
    }

    public CellStyle createCellStyle(MxCellStyle MxStyle, Workbook book, boolean dateTimeFormat)
    {
    	CellStyle style = book.createCellStyle();
        // Create the font for the style.
        Font font = book.createFont();
        font.setItalic(MxStyle.getTextItalic());            
        font.setFontHeightInPoints(MxStyle.getTextHeight().shortValue());
        if (MxStyle.getTextColor() != null && MxStyle.getTextColor() != MxColor.Blank)
        {
            font.setColor(getColor(MxStyle.getTextColor()));
        }
        if (MxStyle.getTextUnderline())
        {
            font.setUnderline(Font.U_SINGLE);
        }
        if (MxStyle.getTextBold())
        {
            font.setBoldweight(Font.BOLDWEIGHT_BOLD);
        }
        style.setFont(font);
        // Alignment
        style.setAlignment(getAlignment(MxStyle.getTextAlignment()));
        style.setVerticalAlignment(getVerticalAlignment(MxStyle.getTextVerticalalignment()));
        // Color fill and other options.
        if (MxStyle.getBackgroundColor() != null && MxStyle.getBackgroundColor() != MxColor.Blank)
        {
            style.setFillForegroundColor(getColor(MxStyle.getBackgroundColor()));
            style.setFillPattern(CellStyle.SOLID_FOREGROUND);
        }
        style.setRotation(MxStyle.getTextRotation().shortValue());
        if (MxStyle.getTextRotation() == 0)
        {
            style.setWrapText(MxStyle.getWrapText());
        }
        // Create border lines.
        if (MxStyle.getBorderTop() > 0)
        {
            style.setBorderTop(MxStyle.getBorderTop().shortValue());
        }
        if (MxStyle.getBorderBottom() > 0)
        {
            style.setBorderBottom(MxStyle.getBorderBottom().shortValue());
        }
        if (MxStyle.getBorderLeft() > 0)
        {
            style.setBorderLeft(MxStyle.getBorderLeft().shortValue());
        }
        if (MxStyle.getBorderRight() > 0)
        {
            style.setBorderRight(MxStyle.getBorderRight().shortValue());
        }
        if (MxStyle.getBorderColor() != null && MxStyle.getBorderColor() != MxColor.Blank)
        {
            style.setTopBorderColor(getColor(MxStyle.getBorderColor()));
            style.setBottomBorderColor(getColor(MxStyle.getBorderColor()));
            style.setLeftBorderColor(getColor(MxStyle.getBorderColor()));
            style.setRightBorderColor(getColor(MxStyle.getBorderColor()));
        } 
        
        if(dateTimeFormat)
        {        	
        	style.setDataFormat(this.createHelper.createDataFormat().getFormat(this.datePresentation));
        	log.trace("Created style with DateTimeFormat: " + style.getDataFormatString());
        }
    	    	   
    	return style;
    }
    
    private static short getColor(MxColor color)
    {
        switch (color)
        {
            case Black:
                return HSSFColor.BLACK.index;
            case Blue:
                return HSSFColor.BLUE.index;
            case Brown:
                return HSSFColor.BROWN.index;
            case Green:
                return HSSFColor.GREEN.index;
            case Light_Blue:
                return HSSFColor.LIGHT_BLUE.index;
            case Orange:
                return HSSFColor.ORANGE.index;
            case Pink:
                return HSSFColor.PINK.index;
            case Red:
                return HSSFColor.RED.index;
            case White:
                return HSSFColor.WHITE.index;
            case Yellow:
                return HSSFColor.YELLOW.index;
            case Gray_1:
                return HSSFColor.GREY_25_PERCENT.index;
            case Gray_2:
                return HSSFColor.GREY_40_PERCENT.index;
            case Gray_3:
                return HSSFColor.GREY_50_PERCENT.index;
            case Gray_4:
                return HSSFColor.GREY_80_PERCENT.index;
            default:
                return HSSFColor.WHITE.index;
        }
    }

    private static short getAlignment(TextAlignment align)
    {
        if (align != null)
        {
            switch (align)
            {
                case Left:
                    return CellStyle.ALIGN_LEFT;
                case Center:
                    return CellStyle.ALIGN_CENTER;
                case Right:
                    return CellStyle.ALIGN_RIGHT;
            }
        }       
        return CellStyle.ALIGN_LEFT;
    }

    private static short getVerticalAlignment(TextVerticalAlignment align)
    {
        if (align != null)
        {
            switch (align)
            {
                case Top:
                    return CellStyle.VERTICAL_TOP;
                case Middle:
                    return CellStyle.VERTICAL_CENTER;
                case Bottom:
                    return CellStyle.VERTICAL_BOTTOM;
            }
        }
        return CellStyle.VERTICAL_TOP;
    }
}
