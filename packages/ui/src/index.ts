// ── Primitives ──
export {
  Alert,
  AlertDescription,
  AlertTitle,
  alertVariants,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  badgeVariants,
  Button,
  type ButtonProps,
  buttonVariants,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  type CardProps,
  CardTitle,
  Checkbox,
  type CheckboxProps,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  type InputProps,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  ScrollArea,
  ScrollBar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Slider,
  Spinner,
  spinnerVariants,
  Switch,
  type SwitchProps,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  type TextareaProps,
  Toast,
  ToastAction,
  Toaster,
  toastVariants,
  Toggle,
  toggleVariants,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@manovaspace/ui";

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu.js";

// ── Composed ──
export {
  ConfirmDialog,
  type ConfirmDialogProps,
  DataValue,
  type DataValueProps,
  formatDataValue,
  EmptyState,
  type EmptyStateProps,
  FieldMessage,
  type FieldMessageProps,
} from "@manovaspace/ui";

export {
  FieldDescription,
  FieldGroup,
} from "./composed/field-feedback.js";

export {
  HoldToConfirmButton,
  type HoldToConfirmButtonProps,
} from "./composed/hold-to-confirm-button.js";

// ── Shell ──
export {
  ShellHeader,
  type ShellHeaderProps,
  type ShellHeaderVariant,
  useShellMenuState,
} from "./composed/shell/shell-header.js";
export {
  NavRail,
  type NavRailProps,
} from "./composed/shell/nav-rail.js";
export {
  NavTree,
  type NavTreeProps,
  type NavItemConfig,
  type NavSubsection,
} from "./composed/shell/nav-tree.js";
export {
  NavMobileSheet,
  type NavMobileSheetProps,
} from "./composed/shell/nav-mobile-sheet.js";

// ── Utilities ──
export {
  cn,
  useToast,
  toast,
  toLocaleDigits,
} from "@manovaspace/ui";
export { persianizeDigits } from "./lib/numeric.js";
export { formatLocaleInteger } from "./lib/locale-format.js";

// ── Theme ──
export { ThemeProvider, ThemeSwitcher, useTheme } from "@manovaspace/ui";

// ── Domain components (Lighthouse-specific) ──
export { LandmarkStageBadge } from "./domain/landmark-stage-badge.js";
