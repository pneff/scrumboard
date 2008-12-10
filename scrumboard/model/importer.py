import logging
import re

from scrumboard import model

log = logging.getLogger(__name__)

class StoryImporter(object):
    def fetch(self, content):
        """Imports data from the confluence table."""
        from sqlalchemy import desc
        stories = model.meta.Session.query(model.Story)
        last_story = stories.order_by(desc(model.story_table.c.position)).first()
        new_pos = last_story.position + 10

        for line in content.split("\n"):
            log.debug("Line: %s", line)

            # Replace links with HTML
            line = re.sub('\[([^|]+)\|([^]]+)\]', '<a href="\\2">\\1</a>', line)
            cols = line.split("|")
            log.debug("Columns: %d", len(cols))
            if len(cols) >= 5:
                title = cols[1].strip()
                area = cols[2].strip()
                try:
                    storypoints = int(cols[3].strip())
                except ValueError:
                    storypoints = 0
                story = model.Story()
                story.title = title
                story.area = area
                story.storypoints = storypoints
                story.position = new_pos
                new_pos += 10
                model.meta.Session.add(story)
        model.meta.Session.commit()
