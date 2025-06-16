import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { TComment } from '@repo/comments/types';

const CommentList = ({ postId }: { postId: string }) => {
  const [comments, setComments] = useState<TComment[]>([]);

  const fetchData = async () => {
    const res = await axios.get(
      `http://localhost:4001/posts/${postId}/comments`
    );

    setComments(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderedComments = comments.map((comment) => {
    return <li key={comment.id}>{comment.content}</li>;
  });

  return <ul>{renderedComments}</ul>;
};

export default CommentList;
