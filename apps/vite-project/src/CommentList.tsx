import type { TComment } from '@repo/comments/types';

const CommentList = ({ comments }: { comments: TComment[] }) => {
  const renderedComments = comments.map((comment) => {
    return (
      <li key={comment.id}>
        {comment.content} {comment.status}
      </li>
    );
  });

  return <ul>{renderedComments}</ul>;
};

export default CommentList;
