/**
 * @private
 * @author Adrian Teodorescu (ateodorescu@gmail.com)
 */
Ext.define('Ext.ux.grid.feature.MultiGroupStore', {
    extend: 'Ext.util.Observable',

    isStore: true,

    constructor: function (groupingFeature, store) {
        var me = this;

        me.superclass.constructor.apply(me, arguments);
        
        me.groupingFeature = groupingFeature;
        me.reconfigure(store);
    },
    
    reconfigure: function(store, force){
        var me = this;
        
        if(force === true){
            me.view.dataSource = me;
            me.view.bindStoreListeners(me);
            me.bindStore(store);
            me.processStore(store);
        }else{
            me.bindStore(store);
            me.processStore(store);
            me.view.dataSource = me;
        }
    },
    
    beforeReconfigure: function(store, oldStore){
        var me = this;
        
        // before doing anything else we have to fetch from the oldStore all groupers and sorters
        store.groupers = oldStore.groupers.clone();
        store.sorters = oldStore.sorters.clone();
        
        Ext.destroy(me.storeListeners);
        me.view.dataSource = me.oldStore;
    },

    bindStore: function (store) {
        var me = this;

        if (me.store) {
            Ext.destroy(me.storeListeners);
            me.store = null;
        }
        if (store) {
            me.storeListeners = store.on({
                bulkremove: me.onBulkRemove,
                add: me.onAdd,
                update: me.onUpdate,
                refresh: me.onRefresh,
                clear: me.onClear,
                scope: me,
                destroyable: true,
                beforesort: me.onBeforeSort
            });
            me.store = store;
            
            /**
            * Store.onUpdate is called after rejecting the changes but this is only working for the standard grouping feature
            * This might change in future versions of Ext JS
            */
            store.onUpdate = Ext.emptyFn;
        }
    },

    processStore: function (store, config) {
        var me = this,
            Model = store.model,
            data = me.data,
            oldGroupCache = me.groupingFeature.groupCache,
            groupCache = me.groupingFeature.groupCache = {},
            groups;

        if (data) {
            data.clear();
        } else {
            data = me.data = new Ext.util.MixedCollection(false, Ext.data.Store.recordIdFn);
        }
        // if no groups were defined then just add all records to data
		if (store.groupers.getCount() === 0) {
            groups = store.getGroups();
            if (groups.length > 0) {
                data.insert(data.length, groups[0].children);
            }
            return;
        }
		
        store.suspendEvents();
        groups = store.getGroupData();
        store.resumeEvents();

        config = config || {};
        
        me.processGroups({
            groups:         groups, 
            oldGroupCache:  oldGroupCache, 
            data:           data, 
            model:          Model, 
            parentKey:      '',
            expandAll:      (typeof config.expandAll != 'undefined') ? config.expandAll : false,
            expandFirstGroupTree:  (typeof config.expandFirstGroupTree != 'undefined') ? config.expandFirstGroupTree : false,
            groupKeysToExpand:  config.groupKeysToExpand
        });
    },

    processGroups: function (config) {
        var me = this,
            groupCount = config.groups.length,
            i,
            group,
            groupPlaceholder,
            groupCache = me.groupingFeature.groupCache,
            collapseAll = me.groupingFeature.startCollapsed,
            expandAll = (config.expandAll === true),
            formatKey = me.groupingFeature.formatKey,
            expandGroup = false;
        
        config.parentProps = config.parentProps || {};
        for (i = 0; i < groupCount; i++) {
            
            if(i === 0){
                expandGroup = config.expandFirstGroupTree === true;
            }else{
                expandGroup = false;
                config.expandFirstGroupTree = false;
            }

            // group contains eg
            // { children: [childRec0, childRec1...], name: <group field value for group> }
            group = config.groups[i];

            // configure the parent properties
            config.parentProps[group.grouper.property] = group.name;

            //group key
            group.key = formatKey(config.parentKey, group.name);

            // Cache group information by group name
            groupCache[group.key] = group;
            group.isCollapsed = (expandAll || expandGroup) ? false: (config.oldGroupCache[group.key] ? config.oldGroupCache[group.key].isCollapsed : collapseAll);
            if(config.groupKeysToExpand){
                config.groupKeysToExpand = Ext.Array.from(config.groupKeysToExpand);
            }
            Ext.each(config.groupKeysToExpand, function(item){
                var reg = new RegExp('^' + group.key);
                group.isCollapsed = group.isCollapsed && !reg.test(item);
            });

            // If group is collapsed, then represent it by one dummy row which is never visible, but which acts
            // as a start and end group trigger.
            if (group.isCollapsed) {
                group.placeholder = groupPlaceholder = new config.model(Ext.clone(config.parentProps), 'group-' + group.key + '-placeholder');
                groupPlaceholder.rows = groupPlaceholder.children = group.records;
                config.data.add(groupPlaceholder);
            }

                // Expanded group - add the group's child records.
            else {
                if (group.children) {
                    me.processGroups({
                        groups:         group.children, 
                        oldGroupCache:  config.oldGroupCache, 
                        data:           config.data, 
                        model:          config.model, 
                        parentKey:      group.key, 
                        parentProps:    config.parentProps,
                        expandAll:      expandAll,
                        expandFirstGroupTree: config.expandFirstGroupTree,
                        groupKeysToExpand:  config.groupKeysToExpand
                    });
                } else {
                    config.data.insert(config.data.length, group.records);
                }
            }
        }
    },

    isCollapsed: function (groupId) {
        return this.groupingFeature.groupCache[groupId].isCollapsed;
    },

    isInCollapsedGroup: function (record) {
        var groupData;

        if (this.store.isGrouped() && (groupData = this.groupingFeature.groupCache[record.get(this.getGroupField())])) {
            return groupData.isCollapsed || false;
        }
        return false;
    },

    getCount: function () {
        return this.data.getCount();
    },

    getTotalCount: function () {
        return this.data.getCount();
    },

    // This class is only created for fully loaded, non-buffered stores
    rangeCached: function () {
        return true;
    },

    getRange: function (start, end, options) {
        var result = this.data.getRange(start, end);

        if (options && options.callback) {
            options.callback.call(options.scope || this, result, start, end, options);
        }
        return result;
    },

    getAt: function (index) {
        return this.getRange(index, index)[0];
    },

    getById: function (id) {
        return this.store.getById(id);
    },

    onRefresh: function (store) {
        this.refreshDataSource(store);
    },

    refreshDataSource: function(config){
        var me = this,
            el = me.groupingFeature.view.getEl(),
            records, keys = [], sm;
        
        // hiding the view element seems to be the best way to have faster rendering
        if(el){
            el.hide();
        }
        
        config = config || {};
        
        // let's see which items are selected so that we expand those groups
        sm = me.groupingFeature.grid.getSelectionModel();
        if(sm instanceof Ext.selection.RowModel){
            records = me.groupingFeature.grid.getSelectionModel().getSelection();
            Ext.each(records, function(item){
                keys.push(me.groupingFeature.getGroupKey(item));
            });
        }else if(sm instanceof Ext.ux.grid.selection.MultiCellModel){
            // check which cells are selected
            
            // check also which records are selected to be able to expand the groups
        }
        
        if(!config.groupKeysToExpand){
            config.groupKeysToExpand = keys;
        }
        
        me.processStore(me.store, config);
        me.groupingFeature.pruneGroupedHeaders();

        //debugger;
        me.fireEvent('refresh', me);

        if(el){
            el.show();
        }
    },

    onBulkRemove: function (store, records, indices) {
        this.processStore(this.store);
        this.fireEvent('refresh', this);
    },

    onClear: function (store, records, startIndex) {
        this.processStore(this.store);
        this.fireEvent('clear', this);
    },

    onAdd: function (store, records, startIndex) {
        this.processStore(this.store);
        this.fireEvent('refresh', this);
    },

    onUpdate: function (store, record, operation, modifiedFieldNames) {
        // quick and dirty solution to update the summaries
        //return this.onRefresh(store);

        // when a record is updated the summaries should also be updated: summaries for all groups that record belongs to.
        // things get complicated when a group is collapsed and the summary has to be updated.

        var me = this,
            groupers = me.groupingFeature.getGroupers().clone(),
            groupersCount = groupers.getCount(),
            groupInfo, lastGroupInfo,
            groupId, i;


        // The grouping field value has been modified.
        // This could either move a record from one group to another, or introduce a new group.
        // Either way, we have to refresh the grid
        if (store.isGrouped()) {
            if (modifiedFieldNames) {
                for (i = 0; i < groupersCount; i++) {
                    if (Ext.Array.contains(modifiedFieldNames, groupers.getAt(i).property)) {
                        return me.onRefresh(me.store);
                    }
                }
            }

            for (i = 0; i < groupersCount ; i++) {
                groupId = me.groupingFeature.getGroupKey(record, groupers.getRange(0, i));
                if (me.groupingFeature.groupCache[groupId]) {
                    lastGroupInfo = groupInfo;
                    groupInfo = me.groupingFeature.groupCache[groupId];
                    // remove the group summaries to recalculate them
                    delete (groupInfo.aggregate);
                }
            }

            // fire events the deepest group of the record and the last child record of this parent's group
            if (groupInfo) {
                me.fireUpdateEvents(record, operation, groupInfo, modifiedFieldNames);
            }
            if (lastGroupInfo && lastGroupInfo !== groupInfo) {
                //var temp = lastGroupInfo.records[lastGroupInfo.records.length - 1];
                var temp = lastGroupInfo.children[lastGroupInfo.children.length - 1];
                if (temp.placeholder) {
                    Ext.suspendLayouts();
                    // Propagate the record's update event
                    //me.fireEvent('update', me, temp.placeholder);
                    Ext.resumeLayouts(true);
                }
            }

        }else{
            // the grid is not grouped so just fire up the update event to the grid.
            me.fireEvent('update', me, record, operation, modifiedFieldNames);
        }
    },

    fireUpdateEvents: function (record, operation, groupInfo, modifiedFieldNames) {
        var me = this, firstRec, lastRec;

        // Fire an update event on the collapsed group placeholder record
        if (groupInfo.isCollapsed) {
            Ext.suspendLayouts();
            me.fireEvent('update', me, groupInfo.placeholder);
            // Fire update event on first and last record in group (only once if a single row group)
            // So that custom header TPL is applied, and the summary row is updated
            firstRec = groupInfo.records[0];
            me.fireEvent('update', me, firstRec, 'edit');
            Ext.resumeLayouts(true);
        } else {
            // Not in a collapsed group, fire update event on the modified record
            // and, if in a grouped store, on the first and last records in the group.
            Ext.suspendLayouts();

            // Propagate the record's update event
            me.fireEvent('update', me, record, operation, modifiedFieldNames);

            // Fire update event on first and last record in group (only once if a single row group)
            // So that custom header TPL is applied, and the summary row is updated
            firstRec = groupInfo.records[0];
            lastRec = groupInfo.records[groupInfo.records.length - 1];

            // Do not pass modifiedFieldNames so that the TableView's shouldUpdateCell call always returns true.
            if (firstRec !== record) {
                me.fireEvent('update', me, firstRec, 'edit');
            }
            if (lastRec !== record && lastRec !== firstRec) {
                me.fireEvent('update', me, lastRec, 'edit');
            }
            me.fireEvent('update', me, groupInfo.aggregate, 'edit');
            Ext.resumeLayouts(true);
        }
    },

    onBeforeSort: function (store, newSorters) {
        // update the groupers sorting according to the store sorters
        if (!store) {
            return;
        }
        Ext.Array.each(newSorters, function (item, index, len) {
            var grouper = store.groupers.getByKey(item.property);
            if (grouper) {
                grouper.setDirection(item.direction);
            }
        });
        return true;
    }
});