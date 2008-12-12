(function() {
    var storyTable = null;
    var storiesNS = YAHOO.scrumboard.stories;
    
    // Table object using the YUI scrolling data table.
    storiesNS.scrollTable = function(id) {
        storiesNS.scrollTable.superclass.constructor.call(this, id);
    };
    YAHOO.lang.extend(storiesNS.scrollTable, storiesNS.table); 
    storiesNS.scrollTable.prototype.createTableObject = function(id, columns, data) {
        return new YAHOO.widget.ScrollingDataTable(id, columns, data, {
            'height': '20em',
            'width': '60em'
        });
    };
    storiesNS.scrollTable.prototype.getColumns = function(id, columns, data) {
        var cols = storiesNS.scrollTable.superclass.getColumns.call(
            this, id, columns, data);
        // Remove drag handle and delete button, add a checkbox
        var checkbox = {
            key: 'select',
            label: 'Select',
            className: 'select-button'
        };
        return [checkbox, cols[1], cols[2], cols[3], cols[4]];
    };
    storiesNS.scrollTable.prototype.onCellClick = function(oArgs) {
        var target = oArgs.target;
        var column = this.table.getColumn(target);
        if (column.key == 'select') {
            this.addStoryToSprint(target);
        } else {
            storiesNS.scrollTable.superclass.onCellClick.call(this, oArgs);
        }
    };
    storiesNS.scrollTable.prototype.addStoryToSprint = function(target) {
        var table = this.table;
        var record = table.getRecord(target);
        YAHOO.util.Connect.asyncRequest(
            'POST',
            '/sprints/' + YAHOO.scrumboard.sprint.id + '/add_story.json',
            {
                success: function(o) {
                    var response = YAHOO.lang.JSON.parse(o.responseText);
                    YAHOO.scrumboard.sprint.stories.table.addRow(response.story);
                    table.deleteRow(target);
                },
                failure: function() {
                    alert("Could not add record to the sprint.");
                }
            },
            'story=' + encodeURIComponent(record.getData('id')));
    };
    
    YAHOO.util.Event.onContentReady('stories_link', function() {
        YAHOO.util.Event.on('stories_link', 'click', function(ev) {
            YAHOO.util.Event.preventDefault(ev);
            if (storyTable === null) {
                storyTable = new storiesNS.scrollTable('stories');
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
