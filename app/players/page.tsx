import { getPlayers } from "@/app/actions/players";
import { getSemesters, getActiveSemester } from "@/app/actions/semesters";
import { getPlayerAttendanceStats, formatRate, formatWinRate } from "@/lib/computations";
import Link from "next/link";
import PlayersSearch from "@/components/PlayersSearch";
import { prisma } from "@/lib/db";
import Image from "next/image";

type Medal = "GOLD" | "SILVER" | "BRONZE" | "NONE";

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ semesterId?: string; search?: string; active?: string }> }) {
    const { semesterId, search, active } = await searchParams;
    const [semesters, activeSemester] = await Promise.all([getSemesters(), getActiveSemester()]);
    const selectedSemesterId = semesterId || activeSemester?.id || semesters[0]?.id;
    const activeOnly = active !== "false";
    const searchQuery = search?.toLowerCase() || "";
    const players = await getPlayers(!activeOnly);
    const attendanceStats = selectedSemesterId ? await getPlayerAttendanceStats(selectedSemesterId) : [];
    const results = await prisma.competitionResult.findMany({ where: { playerId: { in: players.map((p) => p.id) } }, select: { playerId: true, medal: true, wins: true, matches: true } });

    const playersWithStats = players.map((player) => {
        const attendance = attendanceStats.find((item) => item.playerId === player.id);
        const playerResults = results.filter((item) => item.playerId === player.id);
        const medals = { gold: 0, silver: 0, bronze: 0 };
        let totalWins = 0;
        let totalMatches = 0;
        playerResults.forEach((result) => {
            const medal = String(result.medal || "NONE").toUpperCase() as Medal;
            if (medal === "GOLD") medals.gold++;
            if (medal === "SILVER") medals.silver++;
            if (medal === "BRONZE") medals.bronze++;
            totalWins += result.wins || 0;
            totalMatches += result.matches || 0;
        });
        return { ...player, attendanceRate: attendance?.rate || 0, attendanceTotal: attendance?.total || 0, medals, totalWins, totalMatches, winRate: totalMatches ? totalWins / totalMatches : null };
    });
    const filteredPlayers = searchQuery ? playersWithStats.filter((player) => player.fullName.toLowerCase().includes(searchQuery)) : playersWithStats;
    const schoolYear = semesters.find((item) => item.id === selectedSemesterId)?.name || "All school years";

    return <div>
        <header className="compact-page-header"><div><span className="eyebrow">Team roster</span><h1>Players</h1><p><strong>{filteredPlayers.filter((player) => player.isActive).length} active athletes</strong> · {schoolYear}</p></div></header>
        <PlayersSearch semesters={semesters} selectedSemesterId={selectedSemesterId || ""} initialSearch={searchQuery} activeOnly={activeOnly} />
        <div className="table-wrap surface"><table><thead><tr><th>Athlete</th><th>Status</th><th>Attendance</th><th>Readiness</th><th>Medals</th><th>Match record</th><th>Profile</th></tr></thead>
            <tbody>{filteredPlayers.length ? filteredPlayers.map((player) => {
                const profileHref = `/players/${player.id}?semesterId=${selectedSemesterId || ""}`;
                const initials = player.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2);
                return <tr key={player.id} className="clickable">
                    <td><Link className="table-link" href={profileHref}><span className="avatar-initial roster-avatar">{player.profileImageUrl ? <Image src={player.profileImageUrl} alt="" fill sizes="34px" unoptimized /> : initials}</span>{player.fullName}</Link></td>
                    <td><span className={`status-chip ${player.isActive ? "status-active" : "status-inactive"}`}>{player.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="attendance-cell"><div><span>{selectedSemesterId ? formatRate(player.attendanceRate) : "—"}</span><small>{player.attendanceTotal} records</small></div><div className="progress-track"><i style={{ width: `${Math.min(player.attendanceRate * 100, 100)}%` }} /></div></td>
                    <td>{player.attendanceTotal === 0 ? <span className="status-chip status-neutral">No data</span> : player.attendanceRate >= .75 ? <span className="status-chip status-ready">Ready</span> : player.attendanceRate >= .6 ? <span className="status-chip status-monitor">Monitor</span> : <span className="status-chip status-risk">At risk</span>}</td>
                    <td><span className="medal-cluster"><span>🥇 {player.medals.gold}</span><span>🥈 {player.medals.silver}</span><span>🥉 {player.medals.bronze}</span></span></td>
                    <td><span className="record-main">{player.totalWins}–{Math.max(0, player.totalMatches - player.totalWins)}</span><span className="record-sub">{formatWinRate(player.winRate)}</span></td>
                    <td><Link aria-label={`View ${player.fullName}`} href={profileHref} className="btn btn-ghost btn-sm profile-row-action">View profile <span>›</span></Link></td>
                </tr>;
            }) : <tr><td colSpan={7} className="empty-state" style={{ padding: 48 }}><div className="empty-state-icon">TKD</div><div className="empty-state-text">No players found</div></td></tr>}</tbody>
        </table></div>
    </div>;
}
