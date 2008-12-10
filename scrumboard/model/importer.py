import logging
import re

from scrumboard import model

log = logging.getLogger(__name__)

class StoryImporter(object):
    def fetch(self, content):
        """Imports data from the confluence table."""
        for line in content.split("\n"):
            log.debug("Line: %s", line)
            line = self.__confluence_to_html(line)
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
                model.meta.Session.add(story)
        model.meta.Session.commit()
    
    def __confluence_to_html(self, content):
        # Replace links with HTML
        content = re.sub('\[([^|]+)\|([^]]+)\]', '<a href="\\2">\\1</a>', content)
        # Replace *foo* with <strong>foo</strong>
        content = re.sub('\*([^*]+)\*', '<strong>\\1</strong>', content)
        # Replace escaped \! with !
        content = content.replace('\!', '!')
        # Replace escaped \[ with [
        content = content.replace('\[', '[')
        return content
