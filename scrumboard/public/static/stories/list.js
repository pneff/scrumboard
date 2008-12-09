(function() {
    function init() {
        var storiesColumns = [
            {key: 'title', label: 'Title'},
            {key: 'area', label: 'Area'},
            {key: 'storypoints', label: 'Story points'}
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
    }
    
    YAHOO.util.Event.onContentReady('stories', init);
})();
