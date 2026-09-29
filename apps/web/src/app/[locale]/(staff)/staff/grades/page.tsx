import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getGradesOverview } from "./queries";

export default async function GradesListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("staff.grades");

  const data = await getGradesOverview();
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("noActiveCourse")}</p>
      </div>
    );
  }

  const { chapters, missions, draftMap } = data;
  const isFa = locale === "fa";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      {chapters.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noMissions")}</p>
      ) : (
        chapters.map((ch) => {
          const chapterMissions = missions.filter((m) => m.chapterId === ch.id);
          const chapterOrder = isFa ? ch.order.toLocaleString("fa-IR") : ch.order;

          return (
            <div key={ch.id} className="rounded border p-4">
              <h2 className="mb-3 font-semibold">
                {chapterOrder}. {isFa ? ch.titleFa : ch.title}
              </h2>

              {chapterMissions.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("noMissions")}</p>
              ) : (
                <ul className="space-y-2 ps-4">
                  {chapterMissions.map((m) => {
                    const drafts = draftMap.get(m.id) ?? 0;
                    const formattedDrafts = isFa
                      ? drafts.toLocaleString("fa-IR")
                      : drafts.toString();
                    const formattedMaxLumens = isFa
                      ? m.maxLumens.toLocaleString("fa-IR")
                      : m.maxLumens.toString();

                    return (
                      <li key={m.id}>
                        <Link
                          href={`/${locale}/staff/grades/${m.id}`}
                          className="inline-flex items-center text-sm font-medium hover:underline"
                        >
                          <span>{isFa ? m.titleFa : m.title}</span>
                          <span className="ms-2 text-xs text-muted-foreground">
                            ({formattedMaxLumens} {t("lumens")})
                          </span>
                          {drafts > 0 && (
                            <span className="ms-2 rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                              {t("drafts", { count: formattedDrafts })}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
