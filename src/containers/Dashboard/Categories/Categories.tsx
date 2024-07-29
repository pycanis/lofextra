import {
  closestCorners,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  DatabaseMutationOperation,
  useLofikAccount,
  useLofikMutation,
  useLofikQuery,
  useLofikQueryClient,
} from "@lofik/react";
import { useState } from "react";
import { QueryKeys } from "../../../queries";
import { categoriesSchema } from "../../../validators/validators";
import { Category } from "./Category";
import { CategoryFormModal, type ModalCategory } from "./CategoryFormModal";
import styles from "./styles.module.css";

export const Categories = () => {
  const { pubKeyHex } = useLofikAccount();
  const queryClient = useLofikQueryClient();

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const [modalCategory, setModalCategory] = useState<ModalCategory | null>(
    null
  );

  const { data: categories, refetch } = useLofikQuery({
    sql: `
      SELECT * FROM categories 
      WHERE 
        pubKeyHex = '${pubKeyHex}' 
        AND deletedAt IS NULL
      ORDER BY sortOrder`,
    schema: categoriesSchema,
    queryKey: [QueryKeys.GET_CATEGORIES, pubKeyHex],
  });

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSettled: () => {
      refetch();
    },
  });

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id === over?.id || !categories) {
      return;
    }

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over?.id);

    const oldSortOrder = categories[oldIndex].sortOrder;
    const newSortOrder = categories[newIndex].sortOrder;

    // optimistic update
    queryClient.setQueryData(
      [QueryKeys.GET_CATEGORIES, pubKeyHex],
      arrayMove(categories, oldIndex, newIndex)
    );

    mutate({
      operation: DatabaseMutationOperation.Sort,
      tableName: "categories",
      identifierValue: active.id.toString(),
      order: oldSortOrder > newSortOrder ? newSortOrder : newSortOrder + 1,
    });
  };

  return (
    <>
      <div className={styles["overview-container"]}>
        <div>
          <div>categories total</div>
          <div className={styles.large}>
            <strong>{categories?.length ?? 0}</strong>
          </div>
        </div>

        <button
          onClick={() =>
            setModalCategory({
              id: null,
              title: "",
            })
          }
        >
          create category
        </button>
      </div>

      {!!categories?.length && (
        <span className={styles.small}>
          sort categories by dragging a symbol on the left
        </span>
      )}

      <div className={styles.scroll}>
        {categories?.length ? (
          <DndContext
            sensors={sensors}
            onDragEnd={onDragEnd}
            collisionDetection={closestCorners}
          >
            <SortableContext
              items={categories}
              strategy={verticalListSortingStrategy}
            >
              {categories.map((category) => (
                <Category
                  key={category.id}
                  category={category}
                  onDetailClick={(category) => setModalCategory(category)}
                  onDelete={refetch}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div>no categories yet..</div>
        )}
      </div>

      {modalCategory && (
        <CategoryFormModal
          category={modalCategory}
          onSuccess={() => {
            refetch();
          }}
          onClose={() => setModalCategory(null)}
        />
      )}
    </>
  );
};
