(function() {
    var Dom = YAHOO.util.Dom;
    var DEFAULT_STORY = {id: 0, title: 'Untitled', area: '', storypoints: ''};
    var storyTable = null;

    function initNewStoryLink() {
        YAHOO.util.Event.on('new_story', 'click', function(ev) {
            YAHOO.util.Event.preventDefault(ev);
            var table = storyTable.table;
            table.addRow(DEFAULT_STORY);
            var lastRow = table.getLastTrEl();
            var cell = table.getNextTdEl(table.getFirstTdEl(lastRow));
            table.unselectAllCells();
            table.selectCell(cell);
            table.focus();
            setTimeout(function() {
                table.showCellEditor(cell);
            }, 50);
        });
    }
    
    YAHOO.util.Event.onContentReady('stories', function() {
        storyTable = new YAHOO.scrumboard.stories.table('stories');
    });
    YAHOO.util.Event.onContentReady('new_story', initNewStoryLink);
})();
