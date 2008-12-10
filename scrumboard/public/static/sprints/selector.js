(function() {
    var storyTable = null;
    
    // Table object using the YUI scrolling data table.
    YAHOO.scrumboard.stories.scrollTable = function(id) {
        YAHOO.scrumboard.stories.scrollTable.superclass.constructor.call(this, id);
    };
    YAHOO.lang.extend(YAHOO.scrumboard.stories.scrollTable, YAHOO.scrumboard.stories.table); 
    YAHOO.scrumboard.stories.scrollTable.prototype.createTableObject = function(id, columns, data) {
        return new YAHOO.widget.ScrollingDataTable(id, columns, data, {
            'height': '20em',
            'width': '60em'
        });
    };
    
    YAHOO.util.Event.onContentReady('stories', function() {
        storyTable = new YAHOO.scrumboard.stories.scrollTable('stories');
    });
})();
