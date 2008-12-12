"""Routes configuration

The more specific and detailed routes should be defined first so they
may take precedent over the more generic routes. For more information
refer to the routes manual at http://routes.groovie.org/docs/
"""
from pylons import config
from routes import Mapper

def make_map():
    """Create, configure and return the routes Mapper"""
    map = Mapper(directory=config['pylons.paths']['controllers'],
                 always_scan=config['debug'])
    map.minimization = False
    
    # The ErrorController route (handles 404/500 error pages); it should
    # likely stay at the top, ensuring it can always be resolved
    map.connect('/error/{action}', controller='error')
    map.connect('/error/{action}/{id}', controller='error')

    # Explicit ScrumBoard routes
    map.connect('/', controller='stories', action='list')
    map.connect('/stories/list.json', controller='stories', action='list_json')
    map.connect('/stories/reorder.json', controller='stories', action='reorder_json')
    map.connect('/stories/{id}/save.json', controller='stories', action='save_json')
    map.connect('/stories/{id}/delete.json', controller='stories', action='delete_json')
    map.connect('/sprints/{id}/stories.json', controller='sprints', action='stories_json')
    map.connect('/sprints/{id}/add_story.json', controller='sprints', action='add_story_json')
    map.connect('/sprints/{id}/{story_id}/delete.json', controller='sprints', action='delete_story_json')

    # Default routes
    map.connect('/{controller}/{action}')
    map.connect('/{controller}/{action}/{id}')

    return map
