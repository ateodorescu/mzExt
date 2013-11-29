/**
 * This is a mixin which is implementing the following:
 * - there are situations when 2 columns can have the same dataIndex so we need to uniquely identify that column
 *      and calculate the summary accordingly. The unique key is "dataIndex-colIndex".
 * - the renderer that is using the new unique key to display the value
 * - outputSummaryRecord is dinamically changing the column renderer with our own
 * 
 * This mixin is used by the following classes:
 * - Ext.ux.grid.feature.MultiAbstractSummary
 * 
 * @author Adrian Teodorescu (ateodorescu@gmail.com)
 */
Ext.define('Ext.ux.grid.feature.MixinSummary', {

    outputSummaryRecord: function (summaryRecords, contextValues, out) {
        var view = contextValues.view,
            savedRowValues = view.rowValues,
            columns = contextValues.columns || view.headerCt.getGridColumns(),
            colCount = columns.length, i, j, column,
			values;
        // Set up a row rendering values object so that we can call the rowTpl directly to inject
        // the markup of a grid row into the output stream.

        summaryRecords = Ext.Array.from(summaryRecords);
        for (j = 0; j < summaryRecords.length; j++) {
            values = {
                view: view,
                record: summaryRecords[j],
                rowStyle: '',
                // the following classes are listed to be able to update the sumary records when a record update occured
                //rowClasses: [this.summaryRowCls, Ext.baseCSSPrefix + 'grid-row', Ext.baseCSSPrefix + 'grid-data-row'],
                rowClasses: [this.summaryRowCls],
                itemClasses: [],
                recordIndex: -1,
                rowId: view.getRowId(summaryRecords[j]),
                columns: columns,
                visibleColumns: contextValues.visibleColumns || view.headerCt.getVisibleGridColumns()
            };

            // Because we are using the regular row rendering pathway, temporarily swap out the renderer for the summaryRenderer
            for (i = 0; i < colCount; i++) {
                column = columns[i];
                column.savedRenderer = column.renderer;
                if (column[this.summaryRendererProperty]) {
                    // for the group summary fetch it from groupSummaryRenderer attribute
                    column.renderer = column[this.summaryRendererProperty];
                } else if (!column[this.summaryTypeProperty]) {
                    column.renderer = Ext.emptyFn;
                }
                // we don't need this for now until we figure out how to do the indentation
                column.renderer = this.depthSummaryRenderer(column, column.renderer);

                // Summary records may contain values based upon the column's ID if the column is not mapped from a field
                if (!column.dataIndex) {
                    column.dataIndex = column.id;
                }
            }

            // Use the base template to render a summary row
            view.rowValues = values;
            view.self.prototype.rowTpl.applyOut(values, out);
            view.rowValues = savedRowValues;

            // Restore regular column renderers
            for (i = 0; i < colCount; i++) {
                column = columns[i];
                column.renderer = column.savedRenderer;
                column.savedRenderer = null;
            }

        }
    },

    /**
    *   @private
    */
    depthSummaryRenderer: function (column, prevRenderer) {
        var me = this;
        
        return function (value, metaData, record, rowIndex, colIndex, store, view) {
            var fieldName = me.formatColumnField(column);
            
            value = arguments[0] = record.data[fieldName];
            return prevRenderer.apply(column.scope || this, arguments);
        }
    },

    formatColumnField: function(column){
        return (column.dataIndex || column.id) + '-' + column.getIndex();
    },
    
    getSummary: function(store, type, field, group){
        var records = group.records;
        
        if (type) {
            if (Ext.isFunction(type)) {
                return store.getAggregate(type, null, records, [field]);
            }

            switch (type) {
                case 'count':
                    return records.length;
                case 'min':
                    return store.getMin(records, field);
                case 'max':
                    return store.getMax(records, field);
                case 'sum':
                    return store.getSum(records, field);
                case 'average':
                    return store.getAverage(records, field);
                case 'averageExcludeZero':
                    return this.getAverageExcludeZero(records, field);
                default:
                    return '';

            }
        }
    },
    
    getAverageExcludeZero: function(records, field) {
        var i = 0,
            len = 0,
            sum = 0, v;

        if (records.length > 0) {
            for (; i < records.length; ++i) {
                v = records[i].get(field);
                if(Ext.isNumber(v) && v > 0){
                    sum += v;
                    len++;
                }
            }
            return len > 0 ? sum / len : 0;
        }
        return 0;
    }



});