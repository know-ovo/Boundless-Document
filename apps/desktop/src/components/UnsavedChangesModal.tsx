import { Modal, Button, Stack, Text } from '@mantine/core';

interface UnsavedChangesModalProps {
  opened: boolean;
  saving: boolean;
  onSaveAndContinue: () => void | Promise<void>;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedChangesModal({
  opened,
  saving,
  onSaveAndContinue,
  onDiscard,
  onCancel,
}: UnsavedChangesModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title="未保存的更改"
      centered
      closeOnClickOutside={!saving}
      closeOnEscape={!saving}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          当前文档有尚未写入磁盘的修改。要继续操作，请先保存或放弃更改。
        </Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="default" onClick={onCancel} disabled={saving}>
            取消
          </Button>
          <Button variant="light" color="red" onClick={onDiscard} disabled={saving}>
            放弃更改
          </Button>
          <Button loading={saving} onClick={() => void onSaveAndContinue()}>
            保存并继续
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
