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
        c.stories = model.meta.Session.query(model.Story)
        c.stories = c.stories.order_by(model.story_table.c.position)
        c.stories = c.stories.all()
        return render('/derived/stories/list.html')

    def list2(self):
        self.list()
        html = ["<ul>"]
        c.stories = model.meta.Session.query(model.Story)
        c.stories = c.stories.order_by(model.story_table.c.position)
        c.stories = c.stories.all()
        for story in c.stories:
            html.append("<li>")
            html.append(str(story.id))
            html.append(": ")
            html.append(str(story.position))
            html.append(": ")
            html.append(story.title)
            html.append("</li>")
        html.append("</ul>")
        return "".join(html)

    @jsonify
    def reorder_json(self):
        id = request.params.get('id')
        after = request.params.get('after')
        stories = model.meta.Session.query(model.Story)
        story = stories.get(id)

        # Check if we need to re-order
        story_after = stories.get(after)
        equal_pos = stories.filter_by(position = story_after.position + 1)
        equal_pos = equal_pos.filter(model.story_table.c.id != story.id)
        if equal_pos.first():
            # Need to reorder
            pos = 0
            all_stories = stories.order_by(model.story_table.c.position)
            for tmpstory in all_stories.all():
                pos += 1
                if tmpstory.position != pos * 10:
                    tmpstory.position = pos * 10
                    model.meta.Session.add(tmpstory)
        story_after = stories.get(after)
        story.position = story_after.position + 1
        model.meta.Session.add(story)
        model.meta.Session.commit()
        return {'status': 'ok', 'newpos': story.position,
                'record': self.__get_story_dict(story)}

    @jsonify
    def list_json(self):
        self.list()
        stories = [self.__get_story_dict(story) for story in c.stories]
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

    def __get_story_dict(self, story):
        return {'id': story.id, 'title': story.title, 'area': story.area,
                'storypoints': story.storypoints, 'position': story.position}
