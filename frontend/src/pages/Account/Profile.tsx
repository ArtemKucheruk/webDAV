import { useAuth } from '@/auth/RequireAuth/RequireAuth'

const ROW = 'flex items-baseline justify-between gap-6 border-b border-hair py-3'

export function Profile() {
const { user } = useAuth()

return (
    <section>
    <h1 className="mb-8 text-[22px]">account</h1>

    <dl className="max-w-[28rem]">
        <div className={ROW}>
        <dt className="text-[15px] text-ink-3">email</dt>
        <dd>{user.email}</dd>
        </div>
        <div className={ROW}>
        <dt className="text-[15px] text-ink-3">id</dt>
        <dd>{user.user_id}</dd>
        </div>
    </dl>
    </section>
)
}