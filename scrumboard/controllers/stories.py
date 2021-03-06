import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify

from scrumboard.lib.base import BaseController, render
from scrumboard import model

log = logging.getLogger(__name__)

class StoriesController(BaseController):
    def list(self):
        c.heading = "Backlog"
        c.stories = model.Story.get_unassigned()
        return render('/derived/stories/list.html')

    @jsonify
    def reorder_json(self):
        id = request.params.get('id')
        after = request.params.get('after')
        stories = model.meta.Session.query(model.Story)
        story = stories.get(id)
        story_after = stories.get(after)
        model.Story.reorder_if_necessary(story.id, story_after.position + 1)
        story_after = stories.get(after) # Load again to get current position
        story.position = story_after.position + 1
        model.meta.Session.add(story)
        model.meta.Session.commit()
        return {'status': 'ok', 'newpos': story.position,
                'record': story.get_as_dict()}

    @jsonify
    def list_json(self):
        self.list()
        stories = [story.get_as_dict() for story in c.stories]
        return {'stories': stories}

    @jsonify
    def save_json(self, id):
        if id == '0':
            story = model.Story()
        else:
            story = model.meta.Session.query(model.Story).get(id)
        field = request.params.get('field')
        new_value = request.params.get('value')
        setattr(story, field, new_value)
        model.meta.Session.add(story)
        model.meta.Session.commit()
        return {'status': 'ok', 'id': story.id}

    @jsonify
    def delete_json(self, id):
        story = model.meta.Session.query(model.Story).get(id)
        if story is None:
            abort(404)
        model.meta.Session.delete(story)
        model.meta.Session.commit()
        return {'status': 'ok'}
    
    def bulk_import(self):
        if request.method == 'GET':
            return render('/derived/stories/bulk_import.html')
        else:
            from scrumboard.model.importer import StoryImporter
            importer = StoryImporter()
            importer.fetch(request.params.get('content'))
            return redirect_to(controller='stories', action='list')
