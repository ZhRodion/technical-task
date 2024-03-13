import {FC, useEffect, useState} from "react";
import getAuthorsRequest from "src/api/authors/getAuthorsRequest";
import getCommentsRequest from "src/api/comments/getCommentsRequest";
import CommentsItem from "../CommentsItem/CommentsItem";
import styles from "./CommentsList.module.scss";

const CommentsList: FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [comments, setComments] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                // Склейка результата промисов
                const [authorsData, commentsData] = await Promise.all([
                    getAuthorsRequest(),
                    getCommentsRequest(page),
                ]);

                const authorsMap = authorsData.reduce(
                    (map: any, author: any) => {
                        map[author.id] = author;
                        return map;
                    },

                    {},
                );

                // Отсортировываем комментарии по parent
                const sortedComments = commentsData.data.sort(
                    (a: any, b: any) => (a.parent || 0) - (b.parent || 0),
                );

                // Группируем дочерние комментарии по id родителя
                const groupedComments: any = {};
                sortedComments.forEach((comment: any) => {
                    if (comment.parent !== null) {
                        if (!groupedComments[comment.parent]) {
                            groupedComments[comment.parent] = [];
                        }
                        groupedComments[comment.parent].push(comment);
                    }
                });

                // Рекурсивная функция для получения вложенных комментариев
                const getNestedComments: (
                    comments: any[],
                    parentId: number,
                    authorData: any,
                ) => any[] = (comments, parentId, authorData) => {
                    return comments
                        .filter((comment) => comment.parent === parentId)
                        .map((comment) => ({
                            ...comment,
                            nestedComments: getNestedComments(
                                comments,
                                comment.id,
                                authorData,
                            ),
                        }));
                };

                // Обрабатываем комментарии
                const processedComments = sortedComments.map(
                    (comment: any) => ({
                        id: comment.id,
                        avatar: authorsMap[comment.author].avatar,
                        name: authorsMap[comment.author].name,
                        created: comment.created,
                        likes: comment.likes,
                        text: comment.text,
                        nestedComments: getNestedComments(
                            sortedComments,
                            comment.id,
                            authorsMap,
                        ),
                    }),
                );

                setComments((prevComments) => [
                    ...prevComments,
                    ...processedComments,
                ]);
                setLoading(false);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
                setError("Ошибка загрузки");
                setLoading(false);
            }
        };
        fetchComments();
    }, [page]);

    const loadNextPage = () => {
        setPage((prevPage) => prevPage + 1);
    };

    return (
        <div className={styles.commentsWrapper}>
            <div className={styles.commentsList}>
                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    comments.map((item, index) => (
                        <CommentsItem
                            key={`${item.id} - ${index}`}
                            id={item.id}
                            avatar={item.avatar}
                            name={item.name}
                            created={item.created}
                            likes={item.likes}
                            text={item.text}
                            nestedComments={item.nestedComments}
                        />
                    ))
                )}
            </div>
            <button
                className={styles.addMore}
                onClick={loadNextPage}
                type="button"
            >
                Загрузить еще
            </button>
        </div>
    );
};

export default CommentsList;
