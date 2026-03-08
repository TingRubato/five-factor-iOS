from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now())

    profile = relationship("PersonalityProfile",
                           back_populates="user", uselist=False)
    posts = relationship("Post", back_populates="author")


class PersonalityProfile(Base):
    __tablename__ = 'personality_profiles'

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), ForeignKey('users.id'), unique=True, index=True)
    version = Column(String(50), default='ipip-15-v1')

    o_score = Column(Float)
    c_score = Column(Float)
    e_score = Column(Float)
    a_score = Column(Float)
    n_score = Column(Float)

    z_o = Column(Float)
    z_c = Column(Float)
    z_e = Column(Float)
    z_a = Column(Float)
    z_n = Column(Float)

    primary_archetype = Column(String(100), nullable=False)
    secondary_archetype = Column(String(100))
    is_public = Column(Boolean, default=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class Topic(Base):
    __tablename__ = 'topics'

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    description = Column(String(255))

    posts = relationship("Post", back_populates="topic")


class Post(Base):
    __tablename__ = 'posts'

    id = Column(String(36), primary_key=True, index=True)
    author_id = Column(String(36), ForeignKey('users.id'), index=True)
    topic_id = Column(String(36), ForeignKey('topics.id'), index=True)
    title = Column(String(200), nullable=False)
    body = Column(String(5000), nullable=False)

    snapshot_archetype = Column(String(100))
    snapshot_o = Column(Float)
    snapshot_c = Column(Float)
    snapshot_e = Column(Float)
    snapshot_a = Column(Float)
    snapshot_n = Column(Float)

    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now(), index=True)

    author = relationship("User", back_populates="posts")
    topic = relationship("Topic", back_populates="posts")
