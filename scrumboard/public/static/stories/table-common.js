(function() {
    var Dom = YAHOO.util.Dom;
    
    YAHOO.namespace('scrumboard.stories.table');
    YAHOO.scrumboard.stories.table = function(id) {
        this.elementId = id;
        this.ddRow = null;
        this.table = this.createTableObject(id);
    };
    YAHOO.scrumboard.stories.table.prototype = {
        createTableObject: function(id) {
            var columns = this.getColumns();
            var data = this.getDataSource();
            var table = new YAHOO.widget.DataTable(id, columns, data);
            table.set("selectionMode", "singlecell");
            this.subscribeTableEvents(table);
            return table;
        },
        
        getColumns: function() {
            return [
                {   key: 'drag',
                    label: ' ',
                    className: 'drag-button'
                },
                {   key: 'title',
                    label: 'Title',
                    sortable: true,
                    editor: new YAHOO.widget.TextboxCellEditor({
                        asyncSubmitter: this.onTableSaveValue})
                },
                {   key: 'area',
                    label: 'Area',
                    sortable: true,
                    editor: new YAHOO.widget.TextboxCellEditor({
                        asyncSubmitter: this.onTableSaveValue})
                },
                {   key: 'storypoints',
                    label: 'Story points',
                    sortable: true,
                    editor: new YAHOO.widget.TextboxCellEditor({
                        validator: YAHOO.widget.DataTable.validateNumber,
                        asyncSubmitter: this.onTableSaveValue})
                },
                {   key: 'position',
                    label: 'Position',
                    sortable: true,
                    sorted: true,
                    editor: new YAHOO.widget.TextboxCellEditor({
                        validator: YAHOO.widget.DataTable.validateNumber,
                        asyncSubmitter: this.onTableSaveValue})
                },
                {   key: 'delete',
                    label: ' ',
                    className: 'delete-button'
                }
            ];
        },
        
        onTableSaveValue: function(callback, newValue) {
            var record = this.getRecord();
            var column = this.getColumn();
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
            var id = record.getData('id');
            var url = '/stories/' + id + '/save.json';
            YAHOO.util.Connect.asyncRequest('POST',
                url, connectCallbacks,
                'field=' + encodeURIComponent(column.key) + '&' +
                'value=' + encodeURIComponent(newValue));
        },
        
        getDataSource: function() {
            return new YAHOO.util.XHRDataSource("/stories/list.json", {
                responseType: YAHOO.util.DataSource.TYPE_JSON,
                responseSchema: {
                    resultsList: "stories",
                    fields: ["id", "title", "area", "storypoints", "position"]
                }
            });
        },

        subscribeTableEvents: function(table) {
            table.subscribe("cellClickEvent", this.onCellClick, this);
            table.subscribe("cellMouseoverEvent", table.onEventHighlightCell);
            table.subscribe("cellMouseoutEvent", table.onEventUnhighlightCell);
            table.subscribe("cellDblclickEvent", table.onEventShowCellEditor);
            table.subscribe("tableKeyEvent", this.onKeyEvent, this);
            var focusFunction = function(oArgs) { this.table.focus(); };
            table.subscribe("editorSaveEvent", focusFunction);
            table.subscribe("editorCancelEvent", focusFunction);
            table.subscribe("postRenderEvent", this.onPostRender, this);
            table.subscribe('cellMousedownEvent', this.onCellMousedown, this);
            table.subscribe("rowAddEvent", this.onRowAdd, this);
        },

        onCellClick: function(oArgs) {
            var target = oArgs.target;
            var column = this.table.getColumn(target);
            if (column.key == 'delete') {
                if (confirm('Are you sure you want to delete this story?')) {
                    this.removeStory(target);
                }
            } else {
                this.table.onEventSelectCell(oArgs);
            }
        },

        onKeyEvent: function(oArgs) {
            if (oArgs.event.keyCode == YAHOO.util.KeyListener.KEY.ENTER) {
                var cells = this.table.getSelectedTdEls();
                if (cells.length > 0) {
                    setTimeout(function() {
                        this.table.showCellEditor(cells[0]);
                    }, 50);
                }
            }
        },
        
        /**
         * Focus the first cell on load and make drop targets out of every
         * row.
         */
        onPostRender: function(oArgs) {
            if (this.table.getSelectedCells().length === 0) {
                this.table.selectCell(this.table.getNextTdEl(this.table.getFirstTdEl()));
                this.table.focus();

                var rows = Dom.get(this.elementId).getElementsByTagName('tr');
                for (var i = 0; i < rows.length; i++) { 
                    new YAHOO.util.DDTarget(rows[i]);
                }
            }
        },
        
        onCellMousedown: function(ev) {
            if (!Dom.hasClass(ev.target, 'drag-button')) {
                return false;
            }
            var par = this.table.getTrEl(YAHOO.util.Event.getTarget(ev));
            var selectedRow = this.table.getSelectedRows();
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
                this.table.unselectAllRows();
                YAHOO.util.DragDropMgr.stopDrag(ev, true);
                Dom.get(this.getDragEl()).style.visibility = 'hidden';
                Dom.setStyle(this.getEl(), 'position', 'static');
                Dom.setStyle(this.getEl(), 'top', '');
                Dom.setStyle(this.getEl(), 'left', '');
                var drops = YAHOO.util.DragDropMgr.interactionInfo.drop;
                if (drops.length > 0 && this.id != drops[0].id) {
                    var source = Dom.get(this.id);
                    var target = Dom.get(drops[0].id);
                    var sourceRecord = this.table.getRecord(this.id);
                    var targetRecord = this.table.getRecord(drops[0].id);
                    var url = '/stories/reorder.json';
                    YAHOO.util.Connect.asyncRequest('POST',
                        url, {
                            success: function(o) {
                                var response = YAHOO.lang.JSON.parse(o.responseText);
                                this.table.deleteRow(sourceRecord);
                                this.table.addRow(response.record,
                                    this.table.getRecordIndex(targetRecord)+1);
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
            var record = this.table.getRecord(target);
            YAHOO.util.Connect.asyncRequest('DELETE',
                '/stories/' + record.getData('id') + '/delete.json', {
                    success: function (o) {
                        this.table.deleteRow(target);
                    },
                    failure: function (o) {
                        alert("Could not delete this row.");
                    }
                }
            );
        }
    };
})();
