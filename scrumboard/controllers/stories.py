import logging

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect_to
from pylons.decorators import jsonify

from scrumboard.lib.base import BaseController, render
from scrumboard import model

log = logging.getLogger(__name__)

class StoriesController(BaseController):
    def list(self):
        c.stories = model.meta.Session.query(model.Story).all()
        return render('/derived/stories/list.html')

    @jsonify
    def list_json(self):
        self.list()
        stories = [{'id': story.id, 'title': story.title,
            'area': story.area, 'storypoints': story.storypoints}
            for story in c.stories]
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
