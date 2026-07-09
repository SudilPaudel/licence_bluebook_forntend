import { FaBell } from "react-icons/fa";

function ExpiryReminderCard({
  enabled,
  onToggle,
  updating,
  getLabel,
  labels,
  variant = "petrol",
}) {
  const isElectric = variant === "electric";
  const accent = isElectric
    ? {
        border: "border-emerald-200",
        bg: "bg-emerald-50/70",
        icon: "text-emerald-700",
        ring: "focus:ring-emerald-500",
        on: "bg-emerald-600",
        status: "text-emerald-700",
      }
    : {
        border: "border-blue-200",
        bg: "bg-blue-50/70",
        icon: "text-blue-700",
        ring: "focus:ring-blue-500",
        on: "bg-blue-700",
        status: "text-blue-700",
      };

  return (
    <div className={`mb-4 flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${accent.border} ${accent.bg}`}>
      <div className="flex min-w-0 items-start gap-3">
        <FaBell className={`mt-0.5 h-4 w-4 shrink-0 ${accent.icon}`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {getLabel(labels.expiryReminderToggle)}
          </p>
          <p className={`mt-0.5 text-xs ${enabled ? accent.status : "text-gray-500"}`}>
            {enabled
              ? getLabel(labels.expiryReminderEnabled)
              : getLabel(labels.expiryReminderDisabled)}
          </p>
          {updating && (
            <p className="mt-1 text-xs text-gray-500">
              {getLabel(labels.updatingReminderPreference)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 sm:shrink-0">
        <span className="text-xs font-medium text-gray-600">
          {enabled ? getLabel(labels.reminderOn) : getLabel(labels.reminderOff)}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(enabled)}
          aria-label={getLabel(labels.expiryReminderToggle)}
          disabled={updating}
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${accent.ring} ${
            enabled ? accent.on : "bg-gray-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default ExpiryReminderCard;
