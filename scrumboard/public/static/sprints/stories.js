(function() {
    YAHOO.namespace('scrumboard.sprint');
    YAHOO.scrumboard.sprint.id = null;
    YAHOO.scrumboard.sprint.stories = null;
    
    // Table object using the YUI scrolling data table.
    YAHOO.scrumboard.stories.sprintStoryTable = function(id) {
        YAHOO.scrumboard.stories.sprintStoryTable.superclass.constructor.call(this, id);
    };
    YAHOO.lang.extend(YAHOO.scrumboard.stories.sprintStoryTable, YAHOO.scrumboard.stories.table); 
    YAHOO.scrumboard.stories.sprintStoryTable.prototype.getListUrl = function() {
        var id = location.href.substr(location.href.lastIndexOf('/')+1);
        id = parseInt(id, 10);
        YAHOO.scrumboard.sprint.id = id;
        return "/sprints/" + id + "/stories.json";
    };
    
    YAHOO.util.Event.onContentReady('sprintstories', function() {
        YAHOO.scrumboard.sprint.stories = new YAHOO.scrumboard.stories.sprintStoryTable('sprintstories');
    });
})();
