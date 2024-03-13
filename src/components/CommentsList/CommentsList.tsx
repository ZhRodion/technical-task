import {FC, useLayoutEffect, useState} from "react";
import getAuthorsRequest from "src/api/authors/getAuthorsRequest";
import getCommentsRequest from "src/api/comments/getCommentsRequest";
import CommentsItem from "../CommentsItem/CommentsItem";
import styles from "./CommentsList.module.scss";

interface Comment {
    id: number;
    avatar: string;
    name: string;
    created: string;
    likes: number;
    text: string;
    nestedComments: Comment[];
}

const CommentsList: FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [comments, setComments] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    let [page, setPage] = useState<number>(1);

    useLayoutEffect(() => {
        const fetchComments = async () => {
            try {
                // Параллельное выполнение промисов
                const [authorsData, commentsData] = await Promise.all([
                    getAuthorsRequest(),
                    getCommentsRequest(page),
                ]);
                // Подбор автора по id
                const authorsMap = authorsData.reduce(
                    (map: any, author: any) => {
                        map[author.id] = author;
                        return map;
                    },
                    {},
                );
                // Порядок сортировки
                const sortedComments = commentsData.data.sort(
                    (a: any, b: any) => (a.parent || 0) - (b.parent || 0),
                );
                // Приводим к формату Comment интерфейса
                const processComment = (comment: any): Comment => {
                    const processedComment: Comment = {
                        id: comment.id,
                        avatar: authorsMap[comment.author]?.avatar || "",
                        name: authorsMap[comment.author]?.name || "",
                        created: comment.created,
                        likes: comment.likes,
                        text: comment.text,
                        nestedComments: [],
                    };

                    const nestedComments = getNestedComments(
                        comment.id,
                        sortedComments,
                        authorsMap,
                    );
                    if (nestedComments.length > 0) {
                        processedComment.nestedComments = nestedComments;
                    }

                    return processedComment;
                };
                // Рекурсией получаем вложенные комменты (проходится по всем комментам и добавляет вложенные к родительским)
                const getNestedComments = (
                    parentId: number,
                    comments: any[],
                    authorsMap: any,
                ): Comment[] => {
                    const nested: Comment[] = [];
                    for (const comment of comments) {
                        if (comment.parent === parentId) {
                            nested.push({
                                id: comment.id,
                                avatar:
                                    authorsMap[comment.author]?.avatar || "",
                                name: authorsMap[comment.author]?.name || "",
                                created: comment.created,
                                likes: comment.likes,
                                text: comment.text,
                                nestedComments: getNestedComments(
                                    comment.id,
                                    comments,
                                    authorsMap,
                                ),
                            });
                        }
                    }
                    return nested;
                };
                // Фильтруем и возвращаем комменты
                const processedComments = sortedComments
                    .filter((comment: any) => !comment.parent)
                    .map(processComment);

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
    }, []);

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
            <button className={styles.addMore} type="button">
                Загрузить еще
            </button>
        </div>
    );
};

export default CommentsList;
