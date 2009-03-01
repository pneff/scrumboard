(function() {
    var Dom = YAHOO.util.Dom;
    
    YAHOO.namespace('scrumboard.stories.table');
    YAHOO.scrumboard.stories.table = function(id) {
        this.elementId = id;
        this.ddRow = null;
        this.totalsRow = null;
        this.table = this.setupTable(id);
    };
    YAHOO.scrumboard.stories.table.prototype = {
        setupTable: function(id) {
            var columns = this.getColumns();
            var data = this.getDataSource();
            var table = this.createTableObject(id, columns, data);
            table.set("selectionMode", "singlecell");
            this.subscribeTableEvents(table);
            return table;
        },
        
        createTableObject: function(id, columns, data) {
            return new YAHOO.widget.DataTable(id, columns, data);
        },
        
        getColumns: function() {
            var that = this;
            var onTableSaveValue = function(callback, newValue) {
                that.onTableSaveValue(this, callback, newValue);
            };
            return [
                {   key: 'drag',
                    label: ' ',
                    className: 'drag-button'
                },
                {   key: 'title',
                    label: 'Title',
                    sortable: true,
                    editor: new YAHOO.widget.TextboxCellEditor({
                        asyncSubmitter: onTableSaveValue})
                },
                {   key: 'area',
                    label: 'Area',
                    sortable: true,
                    editor: new YAHOO.widget.TextboxCellEditor({
                        asyncSubmitter: onTableSaveValue})
                },
                {   key: 'storypoints',
                    label: 'Story points',
                    sortable: true,
                    editor: new YAHOO.widget.TextboxCellEditor({
                        validator: YAHOO.widget.DataTable.validateNumber,
                        asyncSubmitter: onTableSaveValue})
                },
                {   key: 'position',
                    label: 'Position',
                    sortable: true,
                    sorted: true,
                    editor: new YAHOO.widget.TextboxCellEditor({
                        validator: YAHOO.widget.DataTable.validateNumber,
                        asyncSubmitter: onTableSaveValue})
                },
                {   key: 'delete',
                    label: ' ',
                    className: 'delete-button'
                }
            ];
        },
        
        onTableSaveValue: function(editor, callback, newValue) {
            var record = editor.getRecord();
            var column = editor.getColumn();
            var that = this;
            var connectCallbacks = {
                success: function(o) {
                    var response = YAHOO.lang.JSON.parse(o.responseText);
                    if (record.getData('id') == '0') {
                        record.setData('id', response.id);
                    }
                    callback(true, newValue);
                },
                failure: function() { callback(false, newValue); }
            };
            YAHOO.util.Connect.asyncRequest('POST',
                this.getSaveUrl(record.getData('id')),
                connectCallbacks,
                'field=' + encodeURIComponent(column.key) + '&' +
                'value=' + encodeURIComponent(newValue));
        },
        
        getDataSource: function() {
            return new YAHOO.util.XHRDataSource(this.getListUrl(), {
                responseType: YAHOO.util.DataSource.TYPE_JSON,
                responseSchema: {
                    resultsList: "stories",
                    fields: ["id", "title", "area", "storypoints", "position"]
                }
            });
        },

        subscribeTableEvents: function(table) {
            table.subscribe("cellClickEvent", this.onCellClick, null, this);
            table.subscribe("cellMouseoverEvent", table.onEventHighlightCell);
            table.subscribe("cellMouseoutEvent", table.onEventUnhighlightCell);
            table.subscribe("cellDblclickEvent", table.onEventShowCellEditor, null, this);
            table.subscribe("tableKeyEvent", this.onKeyEvent, null, this);
            var focusFunction = function(oArgs) { this.table.focus(); };
            table.subscribe("editorSaveEvent", focusFunction);
            table.subscribe("editorCancelEvent", focusFunction);
            table.subscribe("postRenderEvent", this.onPostRender, null, this);
            table.subscribe('cellMousedownEvent', this.onCellMousedown, null, this);
            table.subscribe("rowAddEvent", this.onRowAdd, null, this);
        },
        
        getListUrl: function() {
            return "/stories/list.json";
        },
        
        getSaveUrl: function(id) {
            return '/stories/' + id + '/save.json';
        },
        
        getReorderUrl: function() {
            return '/stories/reorder.json';
        },
        
        getDeleteUrl: function(id) {
            return '/stories/' + id + '/delete.json';
        },

        onCellClick: function(oArgs) {
            var target = oArgs.target;
            var column = this.table.getColumn(target);
            if (column.key == 'delete') {
                this.onDeleteCellClick(target);
            } else {
                this.table.onEventSelectCell(oArgs);
            }
        },
        
        onDeleteCellClick: function(target) {
            if (confirm('Are you sure you want to delete this story?')) {
                this.removeStory(target);
            }
        },

        onKeyEvent: function(oArgs) {
            if (oArgs.event.keyCode == YAHOO.util.KeyListener.KEY.ENTER) {
                var table = this.table;
                var cells = table.getSelectedTdEls();
                if (cells.length > 0) {
                    setTimeout(function() {
                        table.showCellEditor(cells[0]);
                    }, 50);
                }
            }
        },
        
        onPostRender: function(oArgs) {
            this.onPostRenderFocusFirstCell();
            this.updateTotals();
        },
        
        /**
         * Focus the first cell on load and make drop targets out of every
         * row.
         */
        onPostRenderFocusFirstCell: function() {
            if (this.table.getSelectedCells().length === 0) {
                this.table.selectCell(this.table.getNextTdEl(this.table.getFirstTdEl()));
                this.table.focus();

                var rows = Dom.get(this.elementId).getElementsByTagName('tr');
                for (var i = 0; i < rows.length; i++) { 
                    new YAHOO.util.DDTarget(rows[i]);
                }
            }
        },
        
        /**
         * Add a row at the bottom with sums.
         */
        updateTotals: function() {
            var tableNode = this.table._elTable;
            var tfootNodes = tableNode.getElementsByTagName('tfoot');
            var tfootNode = null;
            if (tfootNodes.length == 0) {
                // Create tfoot
                tfootNode = document.createElement('tfoot');
                var tr = document.createElement('tr'),
                    td = null, div = null,
                    columns = ['none0', 'title', 'area', 'sp', 'position', 'none1'];
                tfootNode.appendChild(tr);
                for (var i = 0; i < columns.length; i++) {
                    td = document.createElement('td');
                    div = document.createElement('div');
                    div.className = 'yui-dt-liner';
                    div.setAttribute('id', this.elementId + '_' + columns[i]);
                    td.appendChild(div);
                    tr.appendChild(td);
                }
                tableNode.appendChild(tfootNode);
                document.getElementById(this.elementId + '_title').innerHTML = '<strong>Totals</strong>';
            }
            
            var totalStorypoints = 0;
            var records = this.table.getRecordSet().getRecords();
            var data = null;
            for (var i = 0; i < records.length; i++) {
                data = records[i].getData();
                if (data['id'] > -1) {
                    totalStorypoints += data['storypoints'];
                }
            }
            totalStorypoints = '<strong>' + totalStorypoints + '</strong>';
            document.getElementById(this.elementId + '_sp').innerHTML = totalStorypoints;
        },
        
        onCellMousedown: function(ev) {
            if (!Dom.hasClass(ev.target, 'drag-button')) {
                return false;
            }
            var table = this.table;
            var reorderUrl = this.getReorderUrl();
            var par = table.getTrEl(YAHOO.util.Event.getTarget(ev));
            var selectedRow = table.getSelectedRows();
            var prevSelected = null;
            this.ddRow = new YAHOO.util.DDProxy(par.id);
            this.ddRow.handleMouseDown(ev.event);
            this.ddRow.onDragOver = function() {
                Dom.addClass(arguments[1], 'over');
                if (prevSelected && (prevSelected != arguments[1])) {
                    Dom.removeClass(prevSelected, 'over');
                }
                prevSelected = arguments[1];
            };
            this.ddRow.onDragOut = function() {
                Dom.removeClass(prevSelected, 'over');
            };
            this.ddRow.onDragDrop = function(ev) {
                Dom.removeClass(prevSelected, 'over');
                table.unselectAllRows();
                YAHOO.util.DragDropMgr.stopDrag(ev, true);
                Dom.get(this.getDragEl()).style.visibility = 'hidden';
                Dom.setStyle(this.getEl(), 'position', 'static');
                Dom.setStyle(this.getEl(), 'top', '');
                Dom.setStyle(this.getEl(), 'left', '');
                var drops = YAHOO.util.DragDropMgr.interactionInfo.drop;
                if (drops.length > 0 && this.id != drops[0].id) {
                    var source = Dom.get(this.id);
                    var target = Dom.get(drops[0].id);
                    var sourceRecord = table.getRecord(this.id);
                    var targetRecord = table.getRecord(drops[0].id);
                    YAHOO.util.Connect.asyncRequest('POST',
                        reorderUrl,
                        {
                            success: function(o) {
                                var response = YAHOO.lang.JSON.parse(o.responseText);
                                table.deleteRow(sourceRecord);
                                table.addRow(response.record,
                                    table.getRecordIndex(targetRecord)+1);
                            },
                            failure: function() {
                                alert("Could not move record.");
                            }
                        },
                        'id=' + encodeURIComponent(sourceRecord.getData('id')) + '&' +
                        'after=' + encodeURIComponent(targetRecord.getData('id')));
                }
            };
            return true;
        },
        
        onRowAdd: function(oArgs) {
            var row = this.table.getTrEl(oArgs.record);
            new YAHOO.util.DDTarget(row);
        },
        
        removeStory: function(target) {
            var table = this.table;
            var record = table.getRecord(target);
            YAHOO.util.Connect.asyncRequest('DELETE',
                this.getDeleteUrl(record.getData('id')),
                {
                    success: function (o) {
                        table.deleteRow(target);
                    },
                    failure: function (o) {
                        alert("Could not delete this row.");
                    }
                }
            );
        }
    };
})();
