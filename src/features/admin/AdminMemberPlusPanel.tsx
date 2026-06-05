import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  createMistressTrustedMember,
  createPlatformAdminMember,
  listMistressTrustedMembers,
  listPlatformAdminMembers,
  updateMistressTrustedMemberStatus,
  updatePlatformAdminMemberStatus,
} from '../../api/adminMemberDelegationApi';
import {
  createAdminMemberAssignmentDraft,
  getAdminRoleTemplates,
  type AdminMemberAssignment,
  type AdminMemberRoleKey,
  type AdminMemberScope,
  type AdminMemberStatus,
} from './adminMemberDelegationModels';
import {
  listAdminMemberAssignments,
  saveAdminMemberAssignment,
  updateAdminMemberAssignmentStatus,
} from './adminMemberDelegationStore';

const STATUS_TONES: Record<AdminMemberStatus, string> = {
  INVITED: '#d4af37',
  ACTIVE: '#1D9E75',
  PAUSED: '#ff9abf',
  REMOVED: '#777777',
};

type AdminMemberPlusPanelProps = {
  scope?: AdminMemberScope;
  ownerProfileId?: string;
};

function panelStyle() {
  return { backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 10 } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function buttonStyle(color: string) {
  return {
    borderWidth: 1,
    borderColor: color,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 6,
    marginTop: 8,
  } as const;
}

function statusLabel(status: AdminMemberStatus) {
  if (status === 'INVITED') return 'Invited';
  if (status === 'ACTIVE') return 'Active';
  if (status === 'PAUSED') return 'Paused';
  return 'Removed';
}

function AssignmentCard({
  assignment,
  onStatusChange,
}: {
  assignment: AdminMemberAssignment;
  onStatusChange: (id: string, status: AdminMemberStatus) => void;
}) {
  const tone = STATUS_TONES[assignment.status];

  return (
    <View style={{ ...panelStyle(), borderWidth: 1, borderColor: `${tone}88` }}>
      <Text style={{ color: tone, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
        {statusLabel(assignment.status)} · {assignment.scope === 'PLATFORM' ? 'Headmistress Admin Member' : 'Mistress Trusted Member'}
      </Text>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 5 }}>
        {assignment.displayName} · {assignment.roleTitle}
      </Text>
      <Text style={smallText()}>{assignment.assignedJob}</Text>
      <Text style={smallText('#d4af37')}>{assignment.assignedZone}</Text>
      <Text style={smallText()}>{assignment.notes}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {assignment.permissions.map((permission) => (
          <View
            key={`${assignment.id}-${permission}`}
            style={{ borderWidth: 1, borderColor: '#333', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 }}
          >
            <Text style={{ color: '#ccc', fontSize: 10, fontWeight: '800' }}>{permission.replace(/_/g, ' ')}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        <Pressable onPress={() => onStatusChange(assignment.id, 'ACTIVE')} style={buttonStyle('#1D9E75')}>
          <Text style={{ color: '#1D9E75', fontSize: 11, fontWeight: '900' }}>Activate</Text>
        </Pressable>
        <Pressable onPress={() => onStatusChange(assignment.id, 'PAUSED')} style={buttonStyle('#ff9abf')}>
          <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>Pause</Text>
        </Pressable>
        <Pressable onPress={() => onStatusChange(assignment.id, 'REMOVED')} style={buttonStyle('#777')}>
          <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '900' }}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function AdminMemberPlusPanel({ scope = 'PLATFORM', ownerProfileId }: AdminMemberPlusPanelProps) {
  const templates = useMemo(() => getAdminRoleTemplates(scope), [scope]);
  const [selectedRoleKey, setSelectedRoleKey] = useState<AdminMemberRoleKey>(templates[0]?.key || 'MODERATION_ADMIN');
  const [refreshToken, setRefreshToken] = useState(0);
  const [assignments, setAssignments] = useState<AdminMemberAssignment[]>([]);

  const isPlatform = scope === 'PLATFORM';
  const title = isPlatform ? 'Admin Member +' : 'Trusted Member +';
  const subtitle = isPlatform
    ? 'Headmistress can add Admin Members, assign roles, jobs and monitoring zones.'
    : 'Mistress can add trusted helpers for her own profile only.';

  function refresh() {
    setRefreshToken((current) => current + 1);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAssignments() {
      try {
        const nextAssignments = isPlatform
          ? await listPlatformAdminMembers()
          : await listMistressTrustedMembers(ownerProfileId);
        if (!cancelled) {
          setAssignments(nextAssignments);
        }
      } catch {
        if (!cancelled) {
          setAssignments(listAdminMemberAssignments(scope, ownerProfileId));
        }
      }
    }

    loadAssignments();
    return () => {
      cancelled = true;
    };
  }, [isPlatform, ownerProfileId, refreshToken, scope]);

  function createDraft() {
    const role = templates.find((template) => template.key === selectedRoleKey) || templates[0];
    if (!role) return;

    const draft = createAdminMemberAssignmentDraft({
      id: `${scope.toLowerCase()}-${role.key.toLowerCase()}-${Date.now()}`,
      scope,
      displayName: isPlatform ? 'New Admin Member' : 'New Trusted Member',
      accountId: isPlatform ? 'admin_member_pending' : 'trusted_member_pending',
      roleKey: role.key,
      assignedBy: isPlatform ? 'HEADMISTRESS' : 'MISTRESS',
      ownerProfileId,
    });

    const payload = {
      accountId: draft.accountId,
      displayName: draft.displayName,
      roleKey: draft.roleKey,
      assignedJob: draft.assignedJob,
      assignedZone: draft.assignedZone,
      permissions: draft.permissions,
      notes: draft.notes,
      ownerProfileId: draft.ownerProfileId,
    };

    const createRemote = isPlatform ? createPlatformAdminMember : createMistressTrustedMember;
    createRemote(payload)
      .then((created) => {
        saveAdminMemberAssignment(created);
        setAssignments((current) => [created, ...current.filter((assignment) => assignment.id !== created.id)]);
      })
      .catch(() => {
        saveAdminMemberAssignment(draft);
        setAssignments(listAdminMemberAssignments(scope, ownerProfileId));
      })
      .finally(refresh);
  }

  function updateStatus(id: string, status: AdminMemberStatus) {
    const updateRemote = isPlatform ? updatePlatformAdminMemberStatus : updateMistressTrustedMemberStatus;
    updateRemote(id, status)
      .then((updated) => {
        saveAdminMemberAssignment(updated);
        setAssignments((current) => current.map((assignment) => (assignment.id === id ? updated : assignment)));
      })
      .catch(() => {
        updateAdminMemberAssignmentStatus(scope, id, status, ownerProfileId);
        setAssignments(listAdminMemberAssignments(scope, ownerProfileId));
      })
      .finally(refresh);
  }

  return (
    <View style={{ ...panelStyle(), borderWidth: 1, borderColor: '#d4af37' }}>
      <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
        {isPlatform ? 'Administration Zone' : 'Mistress Admin Panel'}
      </Text>
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 6 }}>{title}</Text>
      <Text style={{ color: '#aaa', lineHeight: 18, marginTop: 6 }}>{subtitle}</Text>

      <View style={{ marginTop: 12 }}>
        <Text style={{ color: '#fff', fontWeight: '900', marginBottom: 8 }}>Choose role template</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {templates.map((template) => {
            const selected = selectedRoleKey === template.key;
            return (
              <Pressable
                key={template.key}
                onPress={() => setSelectedRoleKey(template.key)}
                style={{
                  borderWidth: 1,
                  borderColor: selected ? '#d4af37' : '#333',
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                  marginRight: 6,
                  marginBottom: 6,
                  backgroundColor: selected ? '#1a1408' : '#080808',
                }}
              >
                <Text style={{ color: selected ? '#d4af37' : '#ccc', fontSize: 11, fontWeight: '900' }}>
                  {template.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable onPress={createDraft} style={{ ...buttonStyle('#d4af37'), alignSelf: 'flex-start' }}>
        <Text style={{ color: '#d4af37', fontWeight: '900' }}>Create draft assignment</Text>
      </Pressable>

      <View style={{ marginTop: 12 }}>
        {assignments.length === 0 ? (
          <View style={{ ...panelStyle(), backgroundColor: '#0b0b0b' }}>
            <Text style={{ color: '#aaa' }}>No delegated members drafted yet.</Text>
          </View>
        ) : null}

        {assignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} onStatusChange={updateStatus} />
        ))}
      </View>

      <Text style={smallText('#d4af37')}>
        Boundary: Mistress trusted members never become platform Admin Members unless the Headmistress adds them through Admin Member +.
      </Text>
    </View>
  );
}
