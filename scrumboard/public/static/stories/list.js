(function() {
    function saveValue(callback, newValue) {
        var record = this.getRecord();
        var column = this.getColumn();
        var connectCallbacks = {
            success: function() { callback(true, newValue); },
            failure: function() { callback(false, newValue); }
        };
        var id = record.getData('id');
        var url = '/stories/' + id + '/save.json';
        YAHOO.util.Connect.asyncRequest('POST',
            url, connectCallbacks,
            'field=' + encodeURIComponent(column.key) + '&' +
            'value=' + encodeURIComponent(newValue));
    }

    function init() {
        var storiesColumns = [
            {
                key: 'title',
                label: 'Title',
                sortable: true,
                editor: new YAHOO.widget.TextboxCellEditor({asyncSubmitter: saveValue})
            },
            {
                key: 'area',
                label: 'Area',
                sortable: true,
                editor: new YAHOO.widget.TextboxCellEditor({asyncSubmitter: saveValue})
            },
            {
                key: 'storypoints',
                label: 'Story points',
                sortable: true,
                editor: new YAHOO.widget.TextboxCellEditor({
                    validator:YAHOO.widget.DataTable.validateNumber,
                    asyncSubmitter: saveValue})
            }
        ];
        var storiesDataSource = new YAHOO.util.XHRDataSource("/stories/list.json", {
            responseType: YAHOO.util.DataSource.TYPE_JSON,
            responseSchema: {
                resultsList: "stories",
                fields: ["id", "title", "area", "storypoints"]
            }
        });

        var storiesTable = new YAHOO.widget.DataTable("stories",
            storiesColumns, storiesDataSource);
        storiesTable.set("selectionMode", "singlecell");
        storiesTable.subscribe("cellClickEvent", storiesTable.onEventSelectCell);
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
                storiesTable.selectCell(storiesTable.getFirstTdEl());
                storiesTable.focus();
            }
        });
    }
    
    YAHOO.util.Event.onContentReady('stories', init);
})();
