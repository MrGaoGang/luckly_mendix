/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package xlsreport.report;

import java.util.HashMap;

import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import xlsreport.proxies.MxColumn;
import xlsreport.proxies.MxStatic;

/**
 *
 * @author jvg
 */
public class Aggregator
{
    // The integer is the column
    private HashMap<Integer, DescriptiveStatistics> functions;
    private HashMap<Integer, MxStatic> positions;    

    public Aggregator()
    {
        this.functions = new HashMap<Integer, DescriptiveStatistics>();
        this.positions = new HashMap<Integer, MxStatic>();
    }

    public void addColumn(int index, MxColumn column, MxStatic mxStatic)
    {
        functions.put(index, new DescriptiveStatistics());
        positions.put(index, mxStatic);
    }

    public boolean addValue(int index, double value, MxColumn column)
    {
    	DescriptiveStatistics aggr = functions.get(index);
        if(aggr != null)
        {
        	aggr.addValue(value);
            return true;
        }
        return false;
    }

    public boolean ContainsKey(int index)
    {
        return functions.containsKey(index);
    }

    public HashMap<Integer, DescriptiveStatistics> getMap()
    {
        return functions;
    }
    
    public MxStatic getColumnPlace(int index)
    {
    	return this.positions.get(index);
    }
}
