(function() {
    var Dom = YAHOO.util.Dom;
    
    var DEFAULT_STORY = {id: 0, title: 'Untitled', area: '', storypoints: ''};
    
    var storiesTable = null;
    var ddRow = null;
    
    function saveValue(callback, newValue) {
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
    }
    
    function removeStory(target) {
        var record = storiesTable.getRecord(target);
        YAHOO.util.Connect.asyncRequest('DELETE',
            '/stories/' + record.getData('id') + '/delete.json', {
                success: function (o) {
                    storiesTable.deleteRow(target);
                },
                failure: function (o) {
                    alert("Could not delete this row.");
                }
            }
        );
    }

    function initStoryTable() {
        var storiesColumns = [
            {   key: 'drag',
                label: ' ',
                className: 'drag-button'
            },
            {   key: 'title',
                label: 'Title',
                sortable: true,
                editor: new YAHOO.widget.TextboxCellEditor({asyncSubmitter: saveValue})
            },
            {   key: 'area',
                label: 'Area',
                sortable: true,
                editor: new YAHOO.widget.TextboxCellEditor({asyncSubmitter: saveValue})
            },
            {   key: 'storypoints',
                label: 'Story points',
                sortable: true,
                editor: new YAHOO.widget.TextboxCellEditor({
                    validator:YAHOO.widget.DataTable.validateNumber,
                    asyncSubmitter: saveValue})
            },
            {   key: 'position',
                label: 'Position',
                sortable: true,
                sorted: true
            },
            {   key: 'delete',
                label: ' ',
                className: 'delete-button'
            }
        ];
        var storiesDataSource = new YAHOO.util.XHRDataSource("/stories/list.json", {
            responseType: YAHOO.util.DataSource.TYPE_JSON,
            responseSchema: {
                resultsList: "stories",
                fields: ["id", "title", "area", "storypoints", "position"]
            }
        });
        storiesTable = new YAHOO.widget.DataTable("stories",
            storiesColumns, storiesDataSource);
        storiesTable.set("selectionMode", "singlecell");
        storiesTable.subscribe("cellClickEvent", function(oArgs) {
            var target = oArgs.target;
            var column = storiesTable.getColumn(target);
            if (column.key == 'delete') {
                if (confirm('Are you sure you want to delete this story?')) {
                    removeStory(target);
                }
            } else {
                storiesTable.onEventSelectCell(oArgs);
            }
        });
        storiesTable.subscribe("cellMouseoverEvent", storiesTable.onEventHighlightCell);
        storiesTable.subscribe("cellMouseoutEvent", storiesTable.onEventUnhighlightCell);
        storiesTable.subscribe("cellDblclickEvent", storiesTable.onEventShowCellEditor);
        
        // Enable keyboard editing. Need to focus the table again when editor
        // is closed for this to work.
        storiesTable.subscribe("tableKeyEvent", function(oArgs) {
            if (oArgs.event.keyCode == YAHOO.util.KeyListener.KEY.ENTER) {
                var cells = storiesTable.getSelectedTdEls();
                if (cells.length > 0) {
                    setTimeout(function() {
                        storiesTable.showCellEditor(cells[0]);
                    }, 50);
                }
            }
        });
        var focusFunction = function(oArgs) { storiesTable.focus(); };
        storiesTable.subscribe("editorSaveEvent", focusFunction);
        storiesTable.subscribe("editorCancelEvent", focusFunction);
        
        // Focus the first cell on load
        storiesTable.subscribe("postRenderEvent", function(oArgs) {
            if (storiesTable.getSelectedCells().length === 0) {
                storiesTable.selectCell(storiesTable.getNextTdEl(storiesTable.getFirstTdEl()));
                storiesTable.focus();
                
                var rows = Dom.get('stories').getElementsByTagName('tr');
                for (var i = 0; i < rows.length; i++) { 
                    new YAHOO.util.DDTarget(rows[i]);
                }
            }
        });
        
        // Drag & Drop of rows
        storiesTable.subscribe('cellMousedownEvent', function(ev) {
            if (!Dom.hasClass(ev.target, 'drag-button')) {
                return false;
            }
            var par = storiesTable.getTrEl(YAHOO.util.Event.getTarget(ev));
            var selectedRow = storiesTable.getSelectedRows();
            var prevSelected = null;
            ddRow = new YAHOO.util.DDProxy(par.id);
            ddRow.handleMouseDown(ev.event);
            ddRow.onDragOver = function() {
                Dom.addClass(arguments[1], 'over');
                if (prevSelected && (prevSelected != arguments[1])) {
                    Dom.removeClass(prevSelected, 'over');
                }
                prevSelected = arguments[1];
            };
            ddRow.onDragOut = function() {
                Dom.removeClass(prevSelected, 'over');
            };
            ddRow.onDragDrop = function(ev) {
                Dom.removeClass(prevSelected, 'over');
                storiesTable.unselectAllRows();
                YAHOO.util.DragDropMgr.stopDrag(ev, true);
                Dom.get(this.getDragEl()).style.visibility = 'hidden';
                Dom.setStyle(this.getEl(), 'position', 'static');
                Dom.setStyle(this.getEl(), 'top', '');
                Dom.setStyle(this.getEl(), 'left', '');
                var drops = YAHOO.util.DragDropMgr.interactionInfo.drop;
                if (drops.length > 0 && this.id != drops[0].id) {
                    var source = Dom.get(this.id);
                    var target = Dom.get(drops[0].id);
                    var sourceRecord = storiesTable.getRecord(this.id);
                    var targetRecord = storiesTable.getRecord(drops[0].id);
                    var url = '/stories/reorder.json';
                    YAHOO.util.Connect.asyncRequest('POST',
                        url, {
                            success: function(o) {
                                var response = YAHOO.lang.JSON.parse(o.responseText);
                                storiesTable.deleteRow(sourceRecord);
                                storiesTable.addRow(response.record,
                                    storiesTable.getRecordIndex(targetRecord)+1);
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
        });
        storiesTable.subscribe("rowAddEvent", function(oArgs) {
            var row = storiesTable.getTrEl(oArgs.record);
            new YAHOO.util.DDTarget(row);
        });
    }
    
    function initNewStoryLink() {
        YAHOO.util.Event.on('new_story', 'click', function(ev) {
            YAHOO.util.Event.preventDefault(ev);
            storiesTable.addRow(DEFAULT_STORY);
            var lastRow = storiesTable.getLastTrEl();
            var cell = storiesTable.getNextTdEl(storiesTable.getFirstTdEl(lastRow));
            storiesTable.unselectAllCells();
            storiesTable.selectCell(cell);
            storiesTable.focus();
            setTimeout(function() {
                storiesTable.showCellEditor(cell);
            }, 50);
        });
    }
    
    YAHOO.util.Event.onContentReady('stories', initStoryTable);
    YAHOO.util.Event.onContentReady('new_story', initNewStoryLink);
})();
