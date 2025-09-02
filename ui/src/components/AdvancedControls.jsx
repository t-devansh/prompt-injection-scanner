// ui/src/components/AdvancedControls.jsx
import { useState } from "react";
import { Button, Modal, Label, Select, Checkbox } from "flowbite-react";
import { HiAdjustments, HiPlus } from "react-icons/hi";

export default function AdvancedControls({ failOn, setFailOn, rendered, setRendered }) {
  const [openModal, setOpenModal] = useState(false);
  const [openDial, setOpenDial] = useState(false);

  return (
    <>
      {/* Speed Dial floating bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setOpenDial((v) => !v)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none"
          >
            <HiPlus className={`h-6 w-6 transform transition-transform ${openDial ? "rotate-45" : ""}`} />
          </button>

          {/* Action button */}
          {openDial && (
            <div className="absolute bottom-16 right-0 mb-2 flex flex-col items-end space-y-2">
              <button
                onClick={() => {
                  setOpenModal(true);
                  setOpenDial(false);
                }}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <HiAdjustments className="h-5 w-5" /> Adjustments
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal show={openModal} size="md" popup onClose={() => setOpenModal(false)}>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Advanced Scan Options
            </h3>

            {/* Fail_on */}
            <div>
              <Label htmlFor="failOn" value="Fail scan if risk level is at least:" />
              <Select
                id="failOn"
                value={failOn}
                onChange={(e) => setFailOn(e.target.value)}
                className="mt-1"
              >
                <option value="all">No auto-fail</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>

            {/* Rendered */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="rendered"
                checked={rendered}
                onChange={(e) => setRendered(e.target.checked)}
              />
              <Label htmlFor="rendered">Use rendered page (Playwright)</Label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button color="gray" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button color="blue" onClick={() => setOpenModal(false)}>
                Save
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
