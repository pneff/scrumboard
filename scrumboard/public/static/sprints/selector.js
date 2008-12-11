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
    
    YAHOO.util.Event.onContentReady('stories_link', function() {
        YAHOO.util.Event.on('stories_link', 'click', function(ev) {
            YAHOO.util.Event.preventDefault(ev);
            if (storyTable === null) {
                storyTable = new YAHOO.scrumboard.stories.scrollTable('stories');
            }
            YAHOO.util.Dom.removeClass('stories', 'hidden');
            YAHOO.util.Dom.removeClass('stories_close_link', 'hidden');
            YAHOO.util.Dom.addClass('stories_link', 'hidden');
        });
    });
    YAHOO.util.Event.onContentReady('stories_close_link', function() {
        YAHOO.util.Event.on('stories_close_link', 'click', function(ev) {
            YAHOO.util.Event.preventDefault(ev);
            YAHOO.util.Dom.addClass('stories', 'hidden');
            YAHOO.util.Dom.addClass('stories_close_link', 'hidden');
            YAHOO.util.Dom.removeClass('stories_link', 'hidden');
        });
    });
})();
