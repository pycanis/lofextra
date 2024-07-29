import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DatabaseMutationOperation, useLofikMutation } from "@lofik/react";
import { useState } from "react";
import { ConfirmModal } from "../../../components/ConfirmModal";
import { type Category as CategoryType } from "../../../validators/types";
import styles from "./styles.module.css";

type Props = {
  category: CategoryType;
  onDetailClick: (category: CategoryType) => void;
  onDelete: () => void;
};

export const Category = ({ category, onDetailClick, onDelete }: Props) => {
  const [confirm, setOpenConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, attributes: { role: "" } });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { mutate } = useLofikMutation({
    shouldSync: true,
    onSuccess: () => {
      setOpenConfirm(false);
      onDelete();
    },
  });

  const handleDelete = () =>
    mutate({
      operation: DatabaseMutationOperation.Delete,
      tableName: "categories",
      identifierValue: category.id as string,
    });

  return (
    <>
      <div
        className={styles["category-row"]}
        onClick={() => onDetailClick(category)}
        ref={setNodeRef}
        style={sortableStyle}
        {...attributes}
      >
        <div>
          <span
            ref={setActivatorNodeRef}
            className={styles.dnd}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            {...listeners}
          >
            ⋮⋮
          </span>

          <strong>{category.title}</strong>
        </div>

        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent whole row-click event
            setOpenConfirm(true);
          }}
        >
          🗑️
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          onCancel={() => setOpenConfirm(false)}
          onConfirm={handleDelete}
          header="Are you sure to delete the category?"
        />
      )}
    </>
  );
};
