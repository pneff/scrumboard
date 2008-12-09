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
                editor: new YAHOO.widget.TextboxCellEditor({asyncSubmitter: saveValue})
            },
            {
                key: 'area',
                label: 'Area',
                editor: new YAHOO.widget.TextboxCellEditor({asyncSubmitter: saveValue})
            },
            {
                key: 'storypoints',
                label: 'Story points',
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
        storiesTable.subscribe("cellClickEvent", storiesTable.onEventShowCellEditor);
    }
    
    YAHOO.util.Event.onContentReady('stories', init);
})();
