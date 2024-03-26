import React from 'react';

function UpdateModal({ show, handleClose, handleUpdate, updatingImage }) {
  const showHideClassName = show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        <form onSubmit={handleUpdate}>
          <input type="text" name="title" placeholder="New Title" defaultValue={updatingImage?.title} />
          <input type="text" name="description" placeholder="New Description" defaultValue={updatingImage?.description} />
          <input type="text" name="tags" placeholder="New Tags (comma-separated)" defaultValue={updatingImage?.tags.join(', ')} />
          <input type="file" name="image" />
          <button type="submit">Submit Update</button>
        </form>
        <button onClick={handleClose}>Cancel</button>
      </section>
    </div>
  );
}

export default UpdateModal;
