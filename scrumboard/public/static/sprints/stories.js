(function() {
    YAHOO.namespace('scrumboard.sprint');
    var sprintId = location.href.substr(location.href.lastIndexOf('/')+1);
    sprintId = parseInt(sprintId, 10);
    YAHOO.scrumboard.sprint.id = sprintId;
    YAHOO.scrumboard.sprint.stories = null;
    
    // Table object using the YUI scrolling data table.
    YAHOO.scrumboard.stories.sprintStoryTable = function(id) {
        YAHOO.scrumboard.stories.sprintStoryTable.superclass.constructor.call(this, id);
    };
    YAHOO.lang.extend(YAHOO.scrumboard.stories.sprintStoryTable, YAHOO.scrumboard.stories.table); 
    YAHOO.scrumboard.stories.sprintStoryTable.prototype.getListUrl = function() {
        var sprintId = YAHOO.scrumboard.sprint.id;
        return "/sprints/" + sprintId + "/stories.json";
    };
    YAHOO.scrumboard.stories.sprintStoryTable.prototype.getDeleteUrl = function(id) {
        var sprintId = YAHOO.scrumboard.sprint.id;
        return '/sprints/' + sprintId + '/' + id + '/delete.json';
    };
    YAHOO.scrumboard.stories.sprintStoryTable.prototype.onDeleteCellClick = function(target) {
        this.removeStory(target);
    };
    
    YAHOO.util.Event.onContentReady('sprintstories', function() {
        YAHOO.scrumboard.sprint.stories = new YAHOO.scrumboard.stories.sprintStoryTable('sprintstories');
    });
})();
