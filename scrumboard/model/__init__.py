"""The application's model objects"""
import datetime

import sqlalchemy as sa
from sqlalchemy import orm, schema, types, desc

from scrumboard.model import meta

def init_model(engine):
    """Call me before using any of the tables or classes in the model"""
    sm = orm.sessionmaker(autoflush=True, autocommit=False, bind=engine)
    meta.engine = engine
    meta.Session = orm.scoped_session(sm)

def story_allocate_new_position():
    stories = meta.Session.query(Story)
    last_story = stories.order_by(desc(story_table.c.position)).first()
    if last_story is None:
        return 10
    else:
        return last_story.position + 10

sprint_table = schema.Table('sprint', meta.metadata,
    schema.Column('id', types.Integer, schema.Sequence('sprint_seq_id', optional=True), primary_key=True),
    schema.Column('start_date', types.Date(), nullable=False),
    schema.Column('created_at', types.DateTime(), nullable=False, default=datetime.datetime.now),
    schema.Column('updated_at', types.DateTime(), nullable=False, default=datetime.datetime.now, onupdate=datetime.datetime.now),
)

story_table = schema.Table('story', meta.metadata,
    schema.Column('id', types.Integer, schema.Sequence('story_seq_id', optional=True), primary_key=True),
    schema.Column('title', types.Unicode(255), nullable=False),
    schema.Column('area', types.Unicode(255)),
    schema.Column('storypoints', types.Integer),
    schema.Column('created_at', types.DateTime(), nullable=False, default=datetime.datetime.now),
    schema.Column('updated_at', types.DateTime(), nullable=False, default=datetime.datetime.now, onupdate=datetime.datetime.now),
    schema.Column('position', types.Integer(), default=story_allocate_new_position),
)

# n-n relation for stories to sprints
sprintstory_table = schema.Table('sprintstory', meta.metadata,
    schema.Column('sprint_id', types.Integer, schema.ForeignKey('sprint.id')),
    schema.Column('story_id', types.Integer, schema.ForeignKey('story.id')),
    schema.Column('created_at', types.DateTime(), nullable=False, default=datetime.datetime.now),
    schema.Column('updated_at', types.DateTime(), nullable=False, default=datetime.datetime.now, onupdate=datetime.datetime.now),
)

class Sprint(object):
    pass

class Story(object):
    def reorder_all():
        """Reorders the position of all stories to have additional position
        space between all the stories.
        """
        pos = 0
        stories = meta.Session.query(Story)
        stories = stories.order_by(story_table.c.position)
        for story in stories.all():
            pos += 1
            if story.position != pos * 10:
                story.position = pos * 10
                meta.Session.add(story)
        meta.Session.commit()
    reorder_all = staticmethod(reorder_all)

    def reorder_if_necessary(id, newpos):
        """Reorders all stories if necessary. If the newpos is already
        occupied, then stories are reordered.
        """
        stories = meta.Session.query(Story)
        equal_pos = stories.filter_by(position = newpos)
        equal_pos = equal_pos.filter(story_table.c.id != id)
        if equal_pos.first():
            Story.reorder_all()
    reorder_if_necessary = staticmethod(reorder_if_necessary)


orm.mapper(Sprint, sprint_table, properties={
    'stories': orm.relation(Story, secondary=sprintstory_table)
})
orm.mapper(Story, story_table)
