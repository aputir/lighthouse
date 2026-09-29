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
} from "./dropdown-menu";

// ── Composed ──
export {
  DataValue,
  type DataValueProps,
  formatDataValue,
  EmptyState,
  type EmptyStateProps,
  FieldMessage,
  type FieldMessageProps,
} from "@manovaspace/ui";

export {
  ConfirmDialog,
  type ConfirmDialogProps,
} from "./composed/confirm-dialog";

export {
  FieldDescription,
  FieldGroup,
} from "./composed/field-feedback";

export {
  HoldToConfirmButton,
  type HoldToConfirmButtonProps,
} from "./composed/hold-to-confirm-button";

// ── Shell ──
export {
  ShellHeader,
  type ShellHeaderProps,
  type ShellHeaderVariant,
  useShellMenuState,
} from "./composed/shell/shell-header";
export {
  NavRail,
  type NavRailProps,
} from "./composed/shell/nav-rail";
export {
  NavTree,
  type NavTreeProps,
  type NavItemConfig,
  type NavSubsection,
  type NavTreeLinkProps,
} from "./composed/shell/nav-tree";
export {
  NavMobileSheet,
  type NavMobileSheetProps,
} from "./composed/shell/nav-mobile-sheet";

// ── Utilities ──
export {
  cn,
  useToast,
  toast,
  toLocaleDigits,
} from "@manovaspace/ui";
export { persianizeDigits } from "./lib/numeric";
export { formatLocaleInteger } from "./lib/locale-format";

// ── Theme ──
export { ThemeProvider, ThemeSwitcher, useTheme } from "@manovaspace/ui";

// ── Domain components (Lighthouse-specific) ──
export { LandmarkStageBadge } from "./domain/landmark-stage-badge";
